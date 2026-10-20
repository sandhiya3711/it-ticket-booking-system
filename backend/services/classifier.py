import json
import os
from typing import Dict, Any, List, Tuple

# Path to categories definition
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
CATEGORIES_FILE = os.path.join(DATA_DIR, "categories.json")

# Subcategory signature keywords
SUBCATEGORY_RULES: Dict[str, Dict[str, List[str]]] = {
    "Access & Authentication": {
        "Account Lockout": ["locked", "lockout", "disabled", "attempts", "auth-403", "token", "shut out"],
        "Password Reset": ["password", "forgot", "expired", "pwd", "credential", "reset", "change password", "pwd-exp-88"],
        "Login Failure": ["login", "sign in", "unauthorized", "auth", "sso", "mfa", "2fa", "session timeout", "csrf"]
    },
    "Network & Connectivity": {
        "VPN Issue": ["vpn", "tunnel", "atlas", "gateway", "err-tunnel-504", "handshake", "remote"],
        "DNS Issue": ["dns", "nxdomain", "resolve", "nameserver", "lookup", "intranet", "host"],
        "Internet Connectivity": ["wifi", "ethernet", "disconnect", "offline", "ping", "packet loss", "slow"]
    },
    "Software & Applications": {
        "Application Crash": ["crash", "exception", "0xc0000005", "hang", "freeze", "black screen", "unresponsive", "dll"],
        "Installation Issue": ["install", "installer", "code-1603", "msi", "setup", "upgrade", "update", "package"],
        "Application Login": ["session", "csrf", "cookie", "timeout", "credentials", "sign-in", "bounced"]
    },
    "Hardware": {
        "Display Issue": ["monitor", "display", "screen", "flicker", "hdmi", "displayport", "dock", "resolution"],
        "Laptop Issue": ["battery", "fan", "heat", "overheating", "power", "charger", "laptop", "motherboard", "spill"],
        "Keyboard/Mouse": ["keyboard", "mouse", "bluetooth", "trackpad", "keystroke", "lag", "stutter", "dongle"]
    },
    "Email & Collaboration": {
        "Email Issue": ["novamail", "email", "inbox", "quota", "554 5.2.2", "bounce", "mailbox", "messages"],
        "Teams/Chat Issue": ["teams", "chat", "microphone", "mic", "call", "audio", "headset", "worksphere"],
        "Calendar Issue": ["calendar", "meeting", "invite", "appointment", "schedule", "sync conflict"]
    }
}

class TicketClassifier:
    def __init__(self):
        self.categories = self._load_categories()

    def _load_categories(self) -> List[Dict[str, Any]]:
        if os.path.exists(CATEGORIES_FILE):
            with open(CATEGORIES_FILE, "r", encoding="utf-8") as f:
                return json.load(f).get("categories", [])
        return []

    def classify(self, normalized_data: Dict[str, Any], raw_ticket: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classifies a ticket into Category and Subcategory with calibrated confidence.
        """
        tokens = normalized_data.get("tokens", [])
        query_text = (
            f"{normalized_data.get('raw_description', '')} "
            f"{normalized_data.get('raw_error_text', '')} "
            f"{normalized_data.get('detected_application', '')}"
        ).lower()
        
        category_scores: Dict[str, float] = {}
        matched_category_terms: Dict[str, List[str]] = {}

        # 1. Score each main category based on defined keywords and app associations
        for cat in self.categories:
            cat_name = cat["name"]
            score = 0.0
            matched_terms = []
            
            for kw in cat.get("keywords", []):
                if kw.lower() in query_text:
                    score += 1.8 if " " in kw else 1.0
                    matched_terms.append(kw)

            # Application priors
            detected_app = normalized_data.get("detected_application", "")
            if cat_name == "Access & Authentication" and ("password" in query_text or "locked" in query_text or "auth" in query_text):
                score += 2.0
            elif cat_name == "Network & Connectivity" and (detected_app == "Atlas VPN" or detected_app == "Network"):
                score += 2.5
            elif cat_name == "Hardware" and detected_app == "Hardware":
                score += 3.0
            elif cat_name == "Email & Collaboration" and detected_app == "NovaMail" and ("mailbox" in query_text or "email" in query_text):
                score += 2.5
            elif cat_name == "Software & Applications" and detected_app in ["Zenith CRM", "WorkSphere", "CloudDesk"] and ("crash" in query_text or "install" in query_text):
                score += 2.5

            category_scores[cat_name] = score
            matched_category_terms[cat_name] = matched_terms

        # Rank categories
        sorted_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
        top_category, top_cat_score = sorted_categories[0] if sorted_categories else ("Software & Applications", 1.0)
        
        # Determine subcategory
        top_subcategory = "General Issue"
        sub_matched_terms = []
        best_sub_score = -1.0
        
        if top_category in SUBCATEGORY_RULES:
            for sub_name, sub_kws in SUBCATEGORY_RULES[top_category].items():
                current_sub_score = 0.0
                current_matches = []
                for kw in sub_kws:
                    if kw.lower() in query_text:
                        current_sub_score += 1.5 if len(kw) > 4 else 1.0
                        current_matches.append(kw)
                if current_sub_score > best_sub_score:
                    best_sub_score = current_sub_score
                    top_subcategory = sub_name
                    sub_matched_terms = current_matches
        else:
            # Fallback to first declared subcategory
            for cat in self.categories:
                if cat["name"] == top_category and cat.get("subcategories"):
                    top_subcategory = cat["subcategories"][0]
                    break

        # Calculate normalized confidence (0.0 to 1.0)
        total_score = sum(category_scores.values())
        if total_score > 0 and top_cat_score > 0:
            margin = (top_cat_score / (total_score + 1.0))
            raw_conf = min(0.96, 0.40 + (top_cat_score * 0.10) + (margin * 0.35))
        else:
            raw_conf = 0.35  # ambiguous / flat
            top_subcategory = "Unspecified Issue"

        # Generate human-friendly reasoning
        cat_matches = matched_category_terms.get(top_category, [])
        all_cues = list(set(cat_matches + sub_matched_terms))
        
        if all_cues:
            reasoning = (
                f"Identified cues [{', '.join(all_cues[:4])}] and application "
                f"'{normalized_data.get('detected_application')}', strongly routing ticket to "
                f"'{top_category} > {top_subcategory}'."
            )
        else:
            reasoning = (
                f"Sparse keyword signals detected. Assigned '{top_category}' as most probable category "
                f"based on system defaults and application context."
            )

        return {
            "predicted_category": top_category,
            "predicted_subcategory": top_subcategory,
            "confidence_score": round(raw_conf, 2),
            "confidence_percentage": int(round(raw_conf * 100)),
            "reasoning": reasoning,
            "category_rankings": [
                {"category": cat, "score": round(score, 2)}
                for cat, score in sorted_categories[:4]
            ],
            "matched_cues": all_cues
        }

classifier_instance = TicketClassifier()

def classify_ticket(normalized_data: Dict[str, Any], raw_ticket: Dict[str, Any]) -> Dict[str, Any]:
    return classifier_instance.classify(normalized_data, raw_ticket)
