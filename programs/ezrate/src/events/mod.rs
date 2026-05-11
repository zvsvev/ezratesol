use quasar_lang::prelude::*;

#[event(discriminator = 0)]
pub struct EventCreated {
    pub event: Address,
    pub organizer: Address,
    pub max_reviews: u32,
    pub prepaid_lamports: u64,
    pub review_reimbursement_lamports: u64,
}

#[event(discriminator = 1)]
pub struct ReviewSubmitted {
    pub event: Address,
    pub review: Address,
    pub reviewer: Address,
    pub rating: u8,
    pub relayer_reimbursement_lamports: u64,
}
