from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Application, ModerationAction, Notification, Review, User
from .permissions import IsAdmin




def have_worked_together(user_a, user_b):
    """A candidate and a company can review each other only after an application."""
    if user_a.role == 'candidate' and user_b.role == 'company':
        return Application.objects.filter(
            candidate__user=user_a, job__company__user=user_b
        ).exists()
    if user_a.role == 'company' and user_b.role == 'candidate':
        return Application.objects.filter(
            candidate__user=user_b, job__company__user=user_a
        ).exists()
    return False


class ReviewCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            target = User.objects.get(pk=request.data.get('target_user_id'))
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            rating = int(request.data.get('rating'))
        except (TypeError, ValueError):
            return Response({'error': 'rating must be a number from 1 to 5'},
                            status=status.HTTP_400_BAD_REQUEST)
        if rating < 1 or rating > 5:
            return Response({'error': 'rating must be a number from 1 to 5'},
                            status=status.HTTP_400_BAD_REQUEST)

        if not have_worked_together(request.user, target):
            return Response(
                {'error': 'You can only review someone you have worked with (an application between you).'},
                status=status.HTTP_403_FORBIDDEN,
            )

        comment = str(request.data.get('comment', ''))[:500]
        reported = request.data.get('report') is True

        review, created = Review.objects.update_or_create(
            reviewer=request.user,
            target=target,
            defaults={'rating': rating, 'comment': comment, 'reported': reported},
        )

        return Response(
            {'id': review.id, 'rating': review.rating, 'reported': review.reported},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )







# A user is flagged when, since the admin last decided about them:
#   - they have 3 or more reviews and the average rating is below 2.5, OR
#   - 3 or more reviewers reported them.
MIN_REVIEWS = 3
BAD_AVERAGE = 2.5
MIN_REPORTS = 3


def flag_info(user):
    reviews = Review.objects.filter(target=user)
    last = ModerationAction.objects.filter(target=user).order_by('-created_at').first()
    if last:
        reviews = reviews.filter(created_at__gt=last.created_at)

    count = reviews.count()
    if count == 0:
        return None
    average = sum(r.rating for r in reviews) / count
    reports = reviews.filter(reported=True).count()

    reasons = []
    if count >= MIN_REVIEWS and average < BAD_AVERAGE:
        reasons.append(f'Low average rating ({average:.1f} from {count} reviews)')
    if reports >= MIN_REPORTS:
        reasons.append(f'{reports} reports')
    if not reasons:
        return None

    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'is_active': user.is_active,
        'review_count': count,
        'average_rating': round(average, 1),
        'report_count': reports,
        'reasons': reasons,
        'recent_comments': [r.comment for r in reviews.order_by('-created_at')[:5] if r.comment],
    }


class FlaggedListView(APIView):
    """GET /api/admin/flagged/  (admin only)"""
    permission_classes = [IsAdmin]

    def get(self, request):
        candidates = User.objects.filter(reviews_received__isnull=False, role__in=['candidate', 'company']).distinct()
        flagged = [info for info in (flag_info(u) for u in candidates) if info]
        return Response(flagged)


class ModerateView(APIView):
    """POST /api/admin/flagged/<user_id>/   body: {"action": "dismiss" | "warn" | "suspend"}"""
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        if user.role == 'admin':
            return Response({'error': 'Admin accounts cannot be moderated'},
                            status=status.HTTP_403_FORBIDDEN)

        action = request.data.get('action')
        if action not in ('dismiss', 'warn', 'suspend'):
            return Response({'error': 'action must be dismiss, warn or suspend'},
                            status=status.HTTP_400_BAD_REQUEST)

        ModerationAction.objects.create(target=user, action=action, admin=request.user)

        if action == 'warn':
            Notification.objects.create(
                user=user,
                message='Warning: your account received several bad reviews. Please follow the platform rules.',
            )
        elif action == 'suspend':
            user.is_active = False
            user.save(update_fields=['is_active'])

        return Response({'id': user.id, 'action': action, 'is_active': user.is_active})