import { Address } from '@graphprotocol/graph-ts'
import { Account as AccountEntity } from '../generated/schema'

export namespace Account {
  export function getOrCreate(address: Address): AccountEntity {
    let id = address.toHexString()
    let accountEntity = AccountEntity.load(id)

    if (accountEntity != null) {
      return accountEntity as AccountEntity
    }

    accountEntity = new AccountEntity(id)
    accountEntity.address = address
    accountEntity.save()

    return accountEntity as AccountEntity
  }
}
