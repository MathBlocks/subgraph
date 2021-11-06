import {
  AuctionBid,
  AuctionCreated,
  AuctionExtended,
  AuctionMinBidIncrementPercentageUpdated,
  AuctionReservePriceUpdated,
  AuctionSettled,
  AuctionTimeBufferUpdated,
  Paused,
  Unpaused,
} from '../../generated/PrimesAuctionHouse/PrimesAuctionHouse'

import { Auctions } from '../Auctions'

export function handleAuctionBid(event: AuctionBid): void {
  Auctions.createBid(
    event.params.primeId,
    event.params.sender,
    event.params.value,
  )
}

export function handleAuctionCreated(event: AuctionCreated): void {
  Auctions.createAuction(event.address, event.params.primeId)
}

export function handleAuctionExtended(event: AuctionExtended): void {
  Auctions.extendAuction(event.params.primeId, event.params.endTime)
}

export function handleAuctionMinBidIncrementPercentageUpdated(
  event: AuctionMinBidIncrementPercentageUpdated,
): void {
  let primesAuctionHouseEntity = Auctions.getOrCreatePrimesAuctionHouse(
    event.address,
  )
  primesAuctionHouseEntity.minBidIncrementPercentage =
    event.params.minBidIncrementPercentage
  primesAuctionHouseEntity.save()
}

export function handleAuctionReservePriceUpdated(
  event: AuctionReservePriceUpdated,
): void {
  let primesAuctionHouseEntity = Auctions.getOrCreatePrimesAuctionHouse(
    event.address,
  )
  primesAuctionHouseEntity.reservePrice = event.params.reservePrice
  primesAuctionHouseEntity.save()
}

export function handleAuctionSettled(event: AuctionSettled): void {
  Auctions.settleAuction(
    event.params.primeId,
    event.params.winner,
    event.params.amount,
  )
}

export function handleAuctionTimeBufferUpdated(
  event: AuctionTimeBufferUpdated,
): void {
  let primesAuctionHouseEntity = Auctions.getOrCreatePrimesAuctionHouse(
    event.address,
  )
  primesAuctionHouseEntity.timeBuffer = event.params.timeBuffer
  primesAuctionHouseEntity.save()
}

export function handlePaused(event: Paused): void {
  let primesAuctionHouseEntity = Auctions.getOrCreatePrimesAuctionHouse(
    event.address,
  )
  primesAuctionHouseEntity.paused = true
  primesAuctionHouseEntity.save()
}

export function handleUnpaused(event: Unpaused): void {
  let primesAuctionHouseEntity = Auctions.getOrCreatePrimesAuctionHouse(
    event.address,
  )
  primesAuctionHouseEntity.paused = false
  primesAuctionHouseEntity.save()
}
