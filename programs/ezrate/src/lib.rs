#![cfg_attr(not(test), no_std)]

use quasar_lang::prelude::*;

mod events;
mod instructions;
mod state;

use instructions::*;

declare_id!("EZRate1111111111111111111111111111111111111");

#[program]
mod ezrate {
    use super::*;

    #[instruction(discriminator = 0)]
    pub fn create_event(
        ctx: Ctx<CreateEvent>,
        event_id: [u8; 32],
        max_reviews: u32,
        prepaid_lamports: u64,
        review_reimbursement_lamports: u64,
        name: String<96>,
    ) -> Result<(), ProgramError> {
        ctx.accounts.create_event(
            event_id,
            max_reviews,
            prepaid_lamports,
            review_reimbursement_lamports,
            name,
            &ctx.bumps,
        )
    }

    #[instruction(discriminator = 1)]
    pub fn submit_review(
        ctx: Ctx<SubmitReview>,
        reviewer_hash: [u8; 32],
        rating: u8,
        comment_hash: [u8; 32],
    ) -> Result<(), ProgramError> {
        ctx.accounts
            .submit_review(reviewer_hash, rating, comment_hash, &ctx.bumps)
    }
}
