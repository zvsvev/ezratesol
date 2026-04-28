use quasar_lang::prelude::*;

#[event(discriminator = 0)]
pub struct EventCreated {
    pub event: Address,
    pub organizer: Address,
    pub max_reviews: u32,
}

#[event(discriminator = 1)]
pub struct ReviewSubmitted {
    pub event: Address,
    pub review: Address,
    pub rating: u8,
}
