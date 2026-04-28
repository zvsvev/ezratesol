use quasar_lang::prelude::*;

use crate::events::ReviewSubmitted;
use crate::state::{Event, Review};

#[derive(Accounts)]
pub struct SubmitReview<'info> {
    pub relayer: &'info mut Signer,

    #[account(
        mut,
        has_one = relayer,
        seeds = [b"event", event.organizer, event.event_id.as_ref()],
        bump = event.bump
    )]
    pub event: Account<Event<'info>>,

    #[account(init, payer = relayer, seeds = [b"review", event, reviewer_hash.as_ref()], bump)]
    pub review: &'info mut Account<Review>,

    pub clock: &'info Sysvar<Clock>,
    pub system_program: &'info Program<s>,
}

impl<'info> SubmitReview<'info> {
    pub fn submit_review(
        &mut self,
        reviewer_hash: [u8; 32],
        rating: u8,
        comment_hash: [u8; 32],
        bumps: &SubmitReviewBumps,
    ) -> Result<(), ProgramError> {
        require!(rating >= 1 && rating <= 5, ReviewError::InvalidRating);
        require!(
            self.event.review_count < self.event.max_reviews,
            ReviewError::EventFull
        );

        self.review.set_inner(
            *self.event.address(),
            reviewer_hash,
            rating,
            comment_hash,
            u64::from(self.clock.slot),
            bumps.review,
        );
        self.event.review_count = self.event.review_count + 1;

        emit!(ReviewSubmitted {
            event: *self.event.address(),
            review: *self.review.address(),
            rating,
        });

        Ok(())
    }
}

#[error_code]
pub enum ReviewError {
    #[msg("rating must be between 1 and 5")]
    InvalidRating,
    #[msg("event has reached its review limit")]
    EventFull,
}
