import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

import {
  PrimeAuction,
  PrimeAuction as PrimeAuctionEntity,
  PrimeBatch as PrimeBatchEntity,
  PrimesAuctionHouse as PrimesAuctionHouseEntity,
} from '../generated/schema'
import { PrimesAuctionHouse } from '../generated/PrimesAuctionHouse/PrimesAuctionHouse'
import { Primes } from '../generated/Primes/Primes'

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
      batch.whitelist = primes.batch0whitelist()
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
    let auctionData = primesAuctionHouse.auction().toMap()

    auctionEntity.prime = tokenId.toString()
    auctionEntity.startTime = auctionData.get('startTime')!.toBigInt()
    auctionEntity.endTime = auctionData.get('endTime')!.toBigInt()
    auctionEntity.amount = auctionData.get('amount')!.toBigInt()
    auctionEntity.bidder = auctionData.get('bidder')!.toAddress()
    auctionEntity.settled = auctionData.get('settled')!.toBoolean()

    auctionEntity.save()

    return auctionEntity as PrimeAuctionEntity
  }

  export function createBid(
    tokenId: BigInt,
    sender: Bytes,
    value: BigInt,
  ): void {
    let auctionEntity = PrimeAuction.load(
      tokenId.toString(),
    ) as PrimeAuctionEntity

    auctionEntity.amount = value
    auctionEntity.bidder = sender

    auctionEntity.save()
  }

  export function extendAuction(tokenId: BigInt, endTime: BigInt): void {
    let auctionEntity = PrimeAuction.load(
      tokenId.toString(),
    ) as PrimeAuctionEntity

    auctionEntity.endTime = endTime
    auctionEntity.save()
  }

  export function settleAuction(
    tokenId: BigInt,
    bidder: Bytes,
    amount: BigInt,
  ): void {
    let auctionEntity = PrimeAuction.load(
      tokenId.toString(),
    ) as PrimeAuctionEntity

    auctionEntity.bidder = bidder
    auctionEntity.amount = amount
    auctionEntity.settled = true
    auctionEntity.save()
  }
}
