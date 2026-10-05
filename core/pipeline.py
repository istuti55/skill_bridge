"""Rules for moving an application through the recruitment pipeline."""
from django.utils.dateparse import parse_datetime

ALLOWED_TRANSITIONS = {
    'applied': ['shortlisted', 'rejected'],
    'shortlisted': ['interview_scheduled', 'rejected'],
    'interview_scheduled': ['offer_extended', 'rejected'],
    'offer_extended': ['hired', 'rejected'],
    'hired': [],
    'rejected': [],
}


def transition_error(old_stage, new_stage):
    """Return an error message if the move is not allowed, else None."""
    if new_stage == old_stage:
        return None
    allowed = ALLOWED_TRANSITIONS.get(old_stage, [])
    if new_stage not in allowed:
        if not allowed:
            return f"This application is already '{old_stage}' and cannot be changed."
        return (f"Cannot move from '{old_stage}' to '{new_stage}'. "
                f"Allowed next stages: {', '.join(allowed)}.")
    return None


def parse_interview_date(value):
    """ISO date-time string -> datetime, or None if it is not valid."""
    if not value:
        return None
    try:
        return parse_datetime(str(value))
    except ValueError:
        return None