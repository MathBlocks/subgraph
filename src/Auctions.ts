import { Address, BigInt } from '@graphprotocol/graph-ts'

import {
  PrimeAuction,
  PrimeAuction as PrimeAuctionEntity,
  PrimeBatch as PrimeBatchEntity,
  PrimeAuctionBid as PrimeAuctionBidEntity,
  PrimesAuctionHouse as PrimesAuctionHouseEntity,
} from '../generated/schema'
import { PrimesAuctionHouse } from '../generated/PrimesAuctionHouse/PrimesAuctionHouse'
import { Primes } from '../generated/Primes/Primes'
import { Account } from './Account'

export namespace Auctions {
  export function getOrCreatePrimesAuctionHouse(
    address: Address,
  ): PrimesAuctionHouseEntity {
    let id = address.toHexString()
    let primesAuctionHouseEntity = PrimesAuctionHouseEntity.load(id)

    if (primesAuctionHouseEntity != null) {
      return primesAuctionHouseEntity as PrimesAuctionHouseEntity
    }

    let primesAuctionHouse = PrimesAuctionHouse.bind(address)
    let primesAddress = primesAuctionHouse.primes()
    let primes = Primes.bind(primesAddress)

    primesAuctionHouseEntity = new PrimesAuctionHouseEntity(id)
    primesAuctionHouseEntity.address = address
    primesAuctionHouseEntity.primes = primesAddress
    primesAuctionHouseEntity.minBidIncrementPercentage = BigInt.fromI32(
      primesAuctionHouse.minBidIncrementPercentage(),
    )
    primesAuctionHouseEntity.reservePrice = primesAuctionHouse.reservePrice()
    primesAuctionHouseEntity.timeBuffer = primesAuctionHouse.timeBuffer()
    primesAuctionHouseEntity.breedingCooldown = primes.BREEDING_COOLDOWN()
    primesAuctionHouseEntity.paused = false

    primesAuctionHouseEntity.save()

    // Create batch 0
    {
      let batchCheck = primes.batchCheck()
      let batch = new PrimeBatchEntity('0')
      batch.active = true
      batch.remaining = batchCheck.value2.toI32()
      batch.save()
    }

    return primesAuctionHouseEntity as PrimesAuctionHouseEntity
  }

  export function createAuction(
    address: Address,
    tokenId: BigInt,
  ): PrimeAuctionEntity {
    let id = tokenId.toString()
    let auctionEntity = new PrimeAuctionEntity(id)

    let primesAuctionHouseEntity = getOrCreatePrimesAuctionHouse(address)
    primesAuctionHouseEntity.currentPrimeAuction = id
    primesAuctionHouseEntity.save()

    let primesAuctionHouse = PrimesAuctionHouse.bind(
      Address.fromString(primesAuctionHouseEntity.address.toHexString()),
    )
    let auctionData = primesAuctionHouse.auction()

    auctionEntity.prime = tokenId.toString()
    auctionEntity.startTime = auctionData.value2
    auctionEntity.endTime = auctionData.value3
    auctionEntity.amount = auctionData.value1
    auctionEntity.bidder = Account.getOrCreate(auctionData.value4).id
    auctionEntity.settled = auctionData.value5

    auctionEntity.save()

    return auctionEntity as PrimeAuctionEntity
  }

  export function createBid(
    tokenId: BigInt,
    sender: Address,
    value: BigInt,
    timestamp: BigInt,
  ): void {
    let auctionEntity = PrimeAuction.load(
      tokenId.toString(),
    ) as PrimeAuctionEntity

    auctionEntity.amount = value
    auctionEntity.bidder = Account.getOrCreate(sender).id
    auctionEntity.extended = false
    auctionEntity.save()

    {
      let id =
        tokenId.toString() +
        '.' +
        sender.toHexString() +
        '.' +
        timestamp.toString()
      let primeAuctionBidEntity = PrimeAuctionBidEntity.load(id)
      if (primeAuctionBidEntity != null) {
        return
      }
      primeAuctionBidEntity = new PrimeAuctionBidEntity(id)
      primeAuctionBidEntity.sender = Account.getOrCreate(sender).id
      primeAuctionBidEntity.primeAuction = auctionEntity.id
      primeAuctionBidEntity.value = value
      primeAuctionBidEntity.timestamp = timestamp
      primeAuctionBidEntity.save()
    }
  }

  export function extendAuction(tokenId: BigInt, endTime: BigInt): void {
    let auctionEntity = PrimeAuction.load(
      tokenId.toString(),
    ) as PrimeAuctionEntity

    auctionEntity.extended = true
    auctionEntity.endTime = endTime
    auctionEntity.save()
  }

  export function settleAuction(
    tokenId: BigInt,
    bidder: Address,
    amount: BigInt,
  ): void {
    let auctionEntity = PrimeAuction.load(
      tokenId.toString(),
    ) as PrimeAuctionEntity

    auctionEntity.bidder = Account.getOrCreate(bidder).id
    auctionEntity.winner = Account.getOrCreate(bidder).id
    auctionEntity.amount = amount
    auctionEntity.settled = true
    auctionEntity.save()
  }
}
