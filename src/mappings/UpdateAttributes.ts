import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Updated } from '../../generated/UpdateAttributes/UpdateAttributes'
import { Prime } from '../Prime'

// TODO we should probably emit an event when revealing attributes instead
// Or a one-off event to sync all primes
export function handleUpdated(event: Updated): void {
  // FIXME
  let primesAddress = Address.fromString(
    '0x652350a0dba48ac04c02e87f1f8d3c2b6b5ad857',
  )

  let primeEntity = Prime.getOrCreate(
    BigInt.fromI32(event.params.id),
    primesAddress,
  )

  Prime.updateAttributes(primeEntity, primesAddress)

  primeEntity.save()
}
