use quasar_lang::prelude::*;

use crate::events::EventCreated;
use crate::state::Event;

#[derive(Accounts)]
pub struct CreateEvent<'info> {
    pub organizer: &'info mut Signer,
    pub relayer: &'info Signer,

    #[account(init, payer = organizer, seeds = [b"event", organizer, event_id.as_ref()], bump)]
    pub event: Account<Event<'info>>,

    pub rent: &'info Sysvar<Rent>,
    pub system_program: &'info Program<s>,
}

impl<'info> CreateEvent<'info> {
    pub fn create_event(
        &mut self,
        event_id: [u8; 32],
        max_reviews: u32,
        prepaid_lamports: u64,
        review_reimbursement_lamports: u64,
        name: String<96>,
        bumps: &CreateEventBumps,
    ) -> Result<(), ProgramError> {
        require!(max_reviews > 0, EzrateError::InvalidMaxReviews);
        require!(name.len() > 0, EzrateError::InvalidEventName);
        require!(prepaid_lamports > 0, EzrateError::MissingPrepaidFees);
        require!(
            review_reimbursement_lamports > 0,
            EzrateError::InvalidReviewReimbursement
        );

        self.event.set_inner(
            *self.organizer.address(),
            *self.relayer.address(),
            event_id,
            max_reviews,
            0u32,
            prepaid_lamports,
            review_reimbursement_lamports,
            bumps.event,
            name.as_str(),
            self.organizer.to_account_view(),
            Some(&**self.rent),
        );

        self.system_program
            .transfer(self.organizer, &mut self.event, prepaid_lamports)
            .invoke()?;

        emit!(EventCreated {
            event: *self.event.address(),
            organizer: *self.organizer.address(),
            max_reviews,
            prepaid_lamports,
            review_reimbursement_lamports,
        });

        Ok(())
    }
}

#[error_code]
pub enum EzrateError {
    #[msg("max reviews must be greater than zero")]
    InvalidMaxReviews,
    #[msg("event name is required")]
    InvalidEventName,
    #[msg("prepaid review fees are required")]
    MissingPrepaidFees,
    #[msg("review reimbursement must be greater than zero")]
    InvalidReviewReimbursement,
}
