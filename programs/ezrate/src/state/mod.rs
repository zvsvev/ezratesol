use quasar_lang::prelude::*;

#[account(discriminator = 1)]
pub struct Event<'a> {
    pub organizer: Address,
    pub relayer: Address,
    pub event_id: [u8; 32],
    pub max_reviews: u32,
    pub review_count: u32,
    pub bump: u8,
    pub name: String<'a, 96>,
}

#[account(discriminator = 2)]
pub struct Review {
    pub event: Address,
    pub reviewer_hash: [u8; 32],
    pub rating: u8,
    pub comment_hash: [u8; 32],
    pub created_slot: u64,
    pub bump: u8,
}
