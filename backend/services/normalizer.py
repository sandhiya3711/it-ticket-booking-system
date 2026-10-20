import re
from typing import List, Dict, Any, Optional

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
    "but", "by", "can", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't",
    "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't",
    "has", "hasn't", "have", "haven't", "having", "he", "her", "here", "hers", "herself", "him",
    "himself", "his", "how", "i", "i'm", "i've", "i'll", "i'd", "if", "in", "into", "is", "isn't",
    "it", "it's", "its", "itself", "let's", "me", "more", "most", "my", "myself", "no", "nor", "not",
    "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out",
    "over", "own", "same", "she", "should", "shouldn't", "so", "some", "such", "than", "that",
    "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they",
    "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we",
    "were", "weren't", "what", "when", "where", "which", "while", "who", "whom", "why", "with",
    "won't", "would", "wouldn't", "you", "you're", "you've", "you'll", "you'd", "your", "yours",
    "please", "help", "thanks", "thank", "getting", "trying", "says"
}

KNOWN_APPLICATIONS = [
    "NovaMail",
    "Atlas VPN",
    "Orion HR Portal",
    "Zenith CRM",
    "WorkSphere",
    "CloudDesk",
    "Hardware",
    "Network",
    "Corporate Directory"
]

ERROR_CODE_PATTERNS = [
    r"\b[A-Z]{2,10}-[0-9]{3,5}\b",              # e.g. AUTH-403, CODE-1603, PWD-EXP-88
    r"\b0x[0-9A-Fa-f]{6,10}\b",                 # e.g. 0xC0000005, 0x87D1041C
    r"\b[A-Z0-9_]{3,}_[A-Z0-9_]{2,}\b",         # e.g. DNS_PROBE_FINISHED_NXDOMAIN, ERR_TUNNEL_504
    r"\b[0-9]{3}\s+[0-9]\.[0-9]\.[0-9]\b",      # e.g. 554 5.2.2
    r"\bHTTP[- ]?(?:401|403|404|419|500|502|504)\b"
]


def extract_error_codes(text: str, explicit_error: Optional[str] = None) -> List[str]:
    """Finds system error codes and error tokens from description and error_text."""
    found = set()
    combined = f"{text} {explicit_error or ''}"
    for pattern in ERROR_CODE_PATTERNS:
        matches = re.findall(pattern, combined, flags=re.IGNORECASE)
        for m in matches:
            found.add(m.strip().upper())
            
    if explicit_error and explicit_error.strip():
        cleaned_explicit = explicit_error.strip()
        if len(cleaned_explicit) < 60 and cleaned_explicit.lower() not in {"unknown error", "none", "n/a"}:
            found.add(cleaned_explicit.upper())
            
    return sorted(list(found))


def extract_application(text: str, explicit_app: Optional[str] = None) -> str:
    """Identifies application mentioned or relies on explicit application field."""
    if explicit_app and explicit_app.strip() and explicit_app.strip().lower() != "unknown":
        return explicit_app.strip()
        
    lower_text = text.lower()
    for app in KNOWN_APPLICATIONS:
        if app.lower() in lower_text:
            return app
            
    if "vpn" in lower_text or "tunnel" in lower_text:
        return "Atlas VPN"
    if "mail" in lower_text or "inbox" in lower_text or "outlook" in lower_text:
        return "NovaMail"
    if "crm" in lower_text:
        return "Zenith CRM"
    if "hr" in lower_text or "payroll" in lower_text:
        return "Orion HR Portal"
    if "teams" in lower_text or "chat" in lower_text:
        return "WorkSphere"
    if "monitor" in lower_text or "keyboard" in lower_text or "laptop" in lower_text or "battery" in lower_text:
        return "Hardware"
    if "dns" in lower_text or "wifi" in lower_text or "internet" in lower_text:
        return "Network"
        
    return "General / Unassigned"


def clean_text(text: str) -> str:
    """Normalizes text by removing extraneous whitespace and standardizing symbols."""
    if not text:
        return ""
    text = re.sub(r"[\r\n\t]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def tokenize_and_filter(text: str) -> List[str]:
    """Tokenizes string, lowercases, and removes punctuation and common stopwords."""
    raw_tokens = re.findall(r"[A-Za-z0-9_\-\.]{2,}", text.lower())
    filtered = [t for t in raw_tokens if t not in STOPWORDS and len(t) > 2]
    return filtered


def normalize_ticket(ticket_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes the normalization stage on an incoming ticket.
    Returns structured normalized representations.
    """
    description = clean_text(ticket_data.get("description", ""))
    error_text = clean_text(ticket_data.get("error_text", ""))
    declared_app = ticket_data.get("application")

    detected_app = extract_application(f"{description} {error_text}", declared_app)
    error_codes = extract_error_codes(description, error_text)
    tokens = tokenize_and_filter(f"{description} {error_text} {detected_app}")

    combined_clean = f"{description}. Error: {error_text}" if error_text else description

    return {
        "raw_description": description,
        "raw_error_text": error_text,
        "detected_application": detected_app,
        "extracted_error_codes": error_codes,
        "tokens": tokens,
        "token_count": len(tokens),
        "normalized_query": " ".join(tokens),
        "combined_clean_text": combined_clean
    }
