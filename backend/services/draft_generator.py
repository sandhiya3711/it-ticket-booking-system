from typing import Dict, Any, List

def generate_draft_resolution(
    ticket: Dict[str, Any],
    normalized_data: Dict[str, Any],
    classification: Dict[str, Any],
    retrieval_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Synthesizes an analyst-ready customer resolution draft based on the
    retrieved knowledge article and ticket specifics.
    """
    submitter_raw = ticket.get("submitter", "Requester")
    first_name = submitter_raw.split()[0] if submitter_raw else "there"
    
    app_name = ticket.get("application") or normalized_data.get("detected_application", "the application")
    error_text = ticket.get("error_text", "")
    top_article = retrieval_data.get("top_article")
    is_reliable = retrieval_data.get("is_reliable_match", False)

    if not is_reliable or not top_article:
        # Fallback draft for ambiguous or no-match tickets
        draft_text = (
            f"Hello {first_name},\n\n"
            f"Thank you for contacting the IT Service Desk regarding your issue with {app_name}.\n\n"
            f"Based on our initial system assessment, this issue requires further diagnostic details before we can provide step-by-step remediation:\n\n"
            f"1. Please provide the exact error message or a full-screen screenshot of the behavior.\n"
            f"2. Does this occur consistently or intermittently?\n"
            f"3. Are you connected to the corporate office network or remote via Atlas VPN?\n\n"
            f"In the meantime, our Tier 2 engineering team has been notified. "
            f"Please reply directly to this ticket with the requested information so we can assist you promptly.\n\n"
            f"Best regards,\n"
            f"IT Service Desk Support Team"
        )
        return {
            "draft_text": draft_text,
            "is_standard_resolution": False,
            "estimated_mins": 15,
            "source_article_id": None,
            "source_article_title": "Custom / Escalation Request",
            "resolution_steps": [
                "Request screenshot and exact reproduction steps from requester",
                "Check system monitoring logs for service outages",
                "Escalate to Tier 2 specialist if hardware or uncatalogued plugin"
            ]
        }

    # Generate standard resolution draft
    steps_formatted = "\n".join([f"{step}" for step in top_article.get("resolution_steps", [])])
    
    error_mention = f" (Error: {error_text})" if error_text else ""
    
    draft_text = (
        f"Hello {first_name},\n\n"
        f"Thank you for contacting IT Support regarding {app_name}{error_mention}.\n\n"
        f"We have identified standard resolution procedures for this issue ({top_article.get('title')}). "
        f"Please follow the instructions below:\n\n"
        f"{steps_formatted}\n\n"
        f"Once you have completed these steps, please test again and let us know if the issue is resolved. "
        f"If you encounter any difficulty during these steps, feel free to reply to this ticket.\n\n"
        f"Best regards,\n"
        f"IT Service Desk Analyst\n"
        f"Reference KB: {top_article.get('article_id')}"
    )

    return {
        "draft_text": draft_text,
        "is_standard_resolution": True,
        "estimated_mins": top_article.get("estimated_mins", 5),
        "source_article_id": top_article.get("article_id"),
        "source_article_title": top_article.get("title"),
        "resolution_steps": top_article.get("resolution_steps", [])
    }
