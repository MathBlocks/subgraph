import { BigInt } from '@graphprotocol/graph-ts'

import {
  Primes as PrimesContract,
  BatchStarted,
  Bred,
  Listed,
  PrimeClaimed,
  Transfer,
  UnListed,
} from '../../generated/Primes/Primes'
import {
  PrimeBatch as PrimeBatchEntity,
  Prime as PrimeEntity,
  Account as AccountEntity,
} from '../../generated/schema'

import { Prime } from '../Prime'
import { Account } from '../Account'

export function handleBatchStarted(event: BatchStarted): void {
  let primes = PrimesContract.bind(event.address)

  let batchCheck = primes.batchCheck().toMap()

  let id = event.params.batchId.toString()
  let batch = new PrimeBatchEntity(id)

  if (event.params.batchId.equals(BigInt.fromI32(0))) {
    batch.whitelist = primes.batch0whitelist()
  } else if (event.params.batchId.equals(BigInt.fromI32(1))) {
    batch.whitelist = primes.batch1whitelist()

    // Expire batch 0
    let batch0 = PrimeBatchEntity.load('0') as PrimeBatchEntity
    batch0.active = false
    batch0.save()
  } else if (event.params.batchId.equals(BigInt.fromI32(2))) {
    // Expire batch 1
    let batch1 = PrimeBatchEntity.load('1') as PrimeBatchEntity
    batch1.active = false
    batch1.save()
  }

  batch.active = true
  batch.remaining = batchCheck.get('remaining')!.toBoolean()
  batch.save()
}

export function handleBred(event: Bred): void {
  let primes = PrimesContract.bind(event.address)

  let primeEntity = Prime.getOrCreate(
    BigInt.fromI32(event.params.tokenId),
    event.address,
  )

  // Update parent1
  let parent1 = Prime.getOrCreate(event.params.parent1, event.address)
  {
    let coreData = primes.data(event.params.parent1).toMap()
    if (coreData.isSet('lastBred')) {
      parent1.lastBred = coreData.get('lastBred')!.toBigInt()
    }
  }

  // Update parent2
  let parent2 = Prime.getOrCreate(event.params.parent2, event.address)
  {
    let coreData = primes.data(event.params.parent2).toMap()
    if (coreData.isSet('lastBred')) {
      parent2.lastBred = coreData.get('lastBred')!.toBigInt()
    }
  }

  primeEntity.parent1 = parent1.id
  primeEntity.parent2 = parent2.id

  primeEntity.save()
}

export function handleListed(event: Listed): void {
  let primeEntity = Prime.getOrCreate(
    BigInt.fromI32(event.params.tokenId),
    event.address,
  )
  primeEntity.isListed = true
  primeEntity.save()
}

export function handlePrimeClaimed(event: PrimeClaimed): void {
  let primeEntity = Prime.getOrCreate(event.params.tokenId, event.address)
  primeEntity.claimed = true
  primeEntity.save()
}

export function handleTransfer(event: Transfer): void {
  let primeEntity = Prime.getOrCreate(event.params.tokenId, event.address)
  primeEntity.owner = Account.getOrCreate(event.params.to).id
  primeEntity.save()
}

export function handleUnListed(event: UnListed): void {
  let primes = PrimesContract.bind(event.address)
  let rentalData = primes.rental(BigInt.fromI32(event.params.tokenId)).toMap()

  let primeEntity = Prime.getOrCreate(
    BigInt.fromI32(event.params.tokenId),
    event.address,
  )
  primeEntity.isListed = false

  if (rentalData.isSet('isRentable')) {
    primeEntity.isRentable = rentalData.get('isRentable')!.toBoolean()
  } else {
    primeEntity.isRentable = false
  }

  if (rentalData.isSet('whitelistOnly')) {
    primeEntity.whitelistOnly = rentalData.get('whitelistOnly')!.toBoolean()
  } else {
    primeEntity.whitelistOnly = false
  }

  if (rentalData.isSet('studFee')) {
    primeEntity.studFee = rentalData.get('studFee')!.toBigInt()
  }

  if (rentalData.isSet('deadline')) {
    primeEntity.deadline = rentalData.get('deadline')!.toBigInt()
  }

  primeEntity.suitors = []
  primeEntity.save()
}
