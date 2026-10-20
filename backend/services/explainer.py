from typing import Dict, Any, List

def explain_recommendation(
    ticket_data: Dict[str, Any],
    normalized_data: Dict[str, Any],
    classification: Dict[str, Any],
    retrieval_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates explainability metrics and natural language explanation for why
    a particular article was recommended or why it failed reliability thresholds.
    """
    top_article = retrieval_data.get("top_article")
    is_reliable = retrieval_data.get("is_reliable_match", False)
    
    if not top_article or not is_reliable:
        cues = classification.get("matched_cues", [])
        top_score_pct = retrieval_data.get("top_percentage", 0)
        return {
            "is_match_reliable": False,
            "headline": "No Reliable Knowledge Match",
            "summary": (
                f"Top candidate ({top_article['title'] if top_article else 'None'}) scored only {top_score_pct}%, "
                f"which falls below the required 40% confidence threshold. The ticket describes a novel, "
                f"unsupported, or hardware failure scenario without standard self-service steps in the KB."
            ),
            "factors": [
                {"name": "Semantic Match", "weight": f"{top_score_pct}%", "status": "poor"},
                {"name": "Error Code Match", "weight": "None", "status": "missing"},
                {"name": "Application Alignment", "weight": "Partial / Divergent", "status": "warning"}
            ],
            "key_matching_terms": [],
            "recommendation_action": "Escalate to Tier 2 engineering or request additional diagnostics from submitter."
        }

    bonuses = top_article.get("bonuses", {})
    matched_errors = bonuses.get("matched_errors", [])
    matched_tokens = bonuses.get("matched_tokens", [])
    app_affinity = bonuses.get("app_affinity", 0.0)
    cat_alignment = bonuses.get("category_alignment", 0.0)
    raw_cosine = top_article.get("raw_cosine", 0.0)
    
    # Compose natural language explanation
    reasons = []
    if matched_errors:
        reasons.append(f"exact error code match [{', '.join(matched_errors)}]")
    if app_affinity > 0:
        reasons.append(f"direct application match with '{top_article.get('application')}'")
    if matched_tokens:
        reasons.append(f"shared keywords [{', '.join(matched_tokens[:4])}]")
    if cat_alignment > 0:
        reasons.append(f"alignment with predicted category '{classification.get('predicted_category')}'")

    reasons_str = "; ".join(reasons) if reasons else "high overall textual similarity"
    
    summary = (
        f"Article '{top_article['article_id']}: {top_article['title']}' was selected with "
        f"{top_article['similarity_percentage']}% overall match score based on {reasons_str}."
    )

    factors = [
        {
            "name": "TF-IDF Semantic Cosine",
            "score": round(raw_cosine * 100),
            "description": f"Cosine text similarity across symptoms and title ({round(raw_cosine, 2)})",
            "impact": "High" if raw_cosine > 0.4 else "Moderate"
        },
        {
            "name": "Error Signature Verification",
            "score": 100 if matched_errors else 0,
            "description": f"Matched error codes: {', '.join(matched_errors) if matched_errors else 'No direct code match'}",
            "impact": "High" if matched_errors else "Neutral"
        },
        {
            "name": "Application & Domain Affinity",
            "score": 90 if app_affinity > 0 else 30,
            "description": f"Target app: {top_article.get('application')} vs Detected: {normalized_data.get('detected_application')}",
            "impact": "High" if app_affinity > 0 else "Low"
        },
        {
            "name": "Category & Subcategory Routing",
            "score": 85 if cat_alignment > 0 else 40,
            "description": f"Routed to {classification.get('predicted_category')} > {classification.get('predicted_subcategory')}",
            "impact": "Positive" if cat_alignment > 0 else "Neutral"
        }
    ]

    return {
        "is_match_reliable": True,
        "headline": f"Strong Match ({top_article['similarity_percentage']}%) - {top_article['article_id']}",
        "summary": summary,
        "factors": factors,
        "key_matching_terms": list(set(matched_tokens + matched_errors)),
        "recommendation_action": "Review draft resolution steps below and send to requester upon approval."
    }
