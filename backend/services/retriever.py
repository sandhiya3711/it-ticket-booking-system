import json
import os
import numpy as np
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
KB_FILE = os.path.join(DATA_DIR, "knowledge_base.json")

# Reliability threshold: any top score below this triggers "No Reliable Match"
RELIABILITY_THRESHOLD = 0.40

class KnowledgeRetriever:
    def __init__(self):
        self.articles: List[Dict[str, Any]] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.kb_vectors = None
        self._load_and_index_kb()

    def _load_and_index_kb(self):
        if not os.path.exists(KB_FILE):
            return
            
        with open(KB_FILE, "r", encoding="utf-8") as f:
            self.articles = json.load(f)

        # Build corpus representation for each KB article
        corpus = []
        for doc in self.articles:
            title = doc.get("title", "")
            category = doc.get("category", "")
            subcategory = doc.get("subcategory", "")
            app = doc.get("application", "")
            symptoms = " ".join(doc.get("symptoms", []))
            keywords = " ".join(doc.get("keywords", []))
            error_codes = " ".join(doc.get("error_codes", []))
            resolution = " ".join(doc.get("resolution_steps", []))
            
            # Weight important fields by repeating keywords & title
            full_doc_text = f"{title} {title} {app} {category} {subcategory} {symptoms} {keywords} {keywords} {error_codes} {resolution}"
            corpus.append(full_doc_text.lower())

        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            stop_words="english",
            max_df=0.95
        )
        self.kb_vectors = self.vectorizer.fit_transform(corpus)

    def retrieve_and_rank(
        self,
        normalized_data: Dict[str, Any],
        classification: Dict[str, Any],
        top_k: int = 4
    ) -> Dict[str, Any]:
        """
        Calculates hybrid similarity across TF-IDF cosine score, error code matches,
        application affinity, and category alignment.
        """
        if not self.articles or self.vectorizer is None or self.kb_vectors is None:
            return {"ranked_articles": [], "is_reliable_match": False, "status": "NO_RELIABLE_MATCH"}

        query_text = (
            f"{normalized_data.get('raw_description', '')} "
            f"{normalized_data.get('raw_error_text', '')} "
            f"{normalized_data.get('detected_application', '')}"
        ).lower()

        query_vector = self.vectorizer.transform([query_text])
        raw_cosine_scores = cosine_similarity(query_vector, self.kb_vectors)[0]

        ticket_app = normalized_data.get("detected_application", "")
        ticket_errors = set(normalized_data.get("extracted_error_codes", []))
        predicted_cat = classification.get("predicted_category", "")
        predicted_sub = classification.get("predicted_subcategory", "")
        ticket_tokens = set(normalized_data.get("tokens", []))

        ranked_results = []

        for idx, article in enumerate(self.articles):
            base_cosine = float(raw_cosine_scores[idx])
            article_app = article.get("application", "")
            article_cat = article.get("category", "")
            article_sub = article.get("subcategory", "")
            article_errors = set(article.get("error_codes", []))
            article_keywords = set([k.lower() for k in article.get("keywords", [])])

            # 1. Error Code Exact Match Bonus
            error_overlap = ticket_errors.intersection(article_errors)
            error_bonus = 0.28 if len(error_overlap) > 0 else 0.0

            # 2. Application Affinity Bonus
            app_bonus = 0.0
            if article_app.lower() == ticket_app.lower() and ticket_app != "General / Unassigned":
                app_bonus = 0.16
            elif article_app == "All" or article_app == "Hardware":
                if predicted_cat == "Hardware" and article_cat == "Hardware":
                    app_bonus = 0.12

            # 3. Category & Subcategory Alignment Bonus (dampened if zero textual/error overlap)
            cat_bonus = 0.0
            if article_cat == predicted_cat:
                cat_bonus += 0.08
                if article_sub == predicted_sub:
                    cat_bonus += 0.08
            
            # If no keywords or errors match whatsoever, suppress category-only boost
            if len(ticket_tokens.intersection(article_keywords)) == 0 and len(error_overlap) == 0:
                cat_bonus = cat_bonus * 0.25
                app_bonus = app_bonus * 0.50

            # 4. Keyword Overlap Ratio
            token_overlap = ticket_tokens.intersection(article_keywords)
            keyword_score = min(0.20, len(token_overlap) * 0.05)

            # If no exact error match and base semantic cosine is low, scale down bonuses
            if len(error_overlap) == 0 and base_cosine < 0.22:
                bonus_scale = max(0.20, base_cosine / 0.22)
                app_bonus *= bonus_scale
                cat_bonus *= bonus_scale
                keyword_score *= bonus_scale

            # Combined weighted hybrid score
            combined_score = (base_cosine * 0.45) + error_bonus + app_bonus + cat_bonus + (keyword_score * 0.5)
            # Clip between 0.0 and 0.98
            calibrated_score = float(np.clip(combined_score, 0.0, 0.98))

            ranked_results.append({
                "article_id": article["article_id"],
                "title": article["title"],
                "category": article["category"],
                "subcategory": article["subcategory"],
                "application": article["application"],
                "similarity_score": round(calibrated_score, 3),
                "similarity_percentage": int(round(calibrated_score * 100)),
                "raw_cosine": round(base_cosine, 3),
                "bonuses": {
                    "error_match": round(error_bonus, 2),
                    "app_affinity": round(app_bonus, 2),
                    "category_alignment": round(cat_bonus, 2),
                    "matched_tokens": list(token_overlap),
                    "matched_errors": list(error_overlap)
                },
                "resolution_steps": article.get("resolution_steps", []),
                "symptoms": article.get("symptoms", []),
                "estimated_mins": article.get("estimated_mins", 5)
            })

        # Sort descending by similarity
        ranked_results.sort(key=lambda x: x["similarity_score"], reverse=True)
        top_matches = ranked_results[:top_k]

        top_score = top_matches[0]["similarity_score"] if top_matches else 0.0
        
        # Check reliability threshold
        is_reliable = top_score >= RELIABILITY_THRESHOLD
        
        if top_score >= 0.65:
            status = "CONFIDENT_MATCH"
            status_message = "High-confidence article match detected."
        elif top_score >= RELIABILITY_THRESHOLD:
            status = "POTENTIAL_MATCH"
            status_message = "Moderate similarity. Analyst verification advised."
        else:
            status = "NO_RELIABLE_MATCH"
            status_message = "No reliable knowledge article found in local KB. Escalation or manual review recommended."

        return {
            "top_article": top_matches[0] if top_matches else None,
            "ranked_articles": top_matches,
            "top_score": top_score,
            "top_percentage": int(round(top_score * 100)),
            "is_reliable_match": is_reliable,
            "status": status,
            "status_message": status_message,
            "threshold": RELIABILITY_THRESHOLD
        }

retriever_instance = KnowledgeRetriever()

def retrieve_knowledge(
    normalized_data: Dict[str, Any],
    classification: Dict[str, Any],
    top_k: int = 4
) -> Dict[str, Any]:
    return retriever_instance.retrieve_and_rank(normalized_data, classification, top_k)
