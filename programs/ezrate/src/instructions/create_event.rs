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
        name: String<96>,
        bumps: &CreateEventBumps,
    ) -> Result<(), ProgramError> {
        require!(max_reviews > 0, EzrateError::InvalidMaxReviews);
        require!(name.len() > 0, EzrateError::InvalidEventName);

        self.event.set_inner(
            *self.organizer.address(),
            *self.relayer.address(),
            event_id,
            max_reviews,
            0u32,
            bumps.event,
            name.as_str(),
            self.organizer.to_account_view(),
            Some(&**self.rent),
        );

        emit!(EventCreated {
            event: *self.event.address(),
            organizer: *self.organizer.address(),
            max_reviews,
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
}
