import {
  Address,
  BigInt,
  json,
  Bytes,
  JSONValue,
  log,
} from '@graphprotocol/graph-ts'
import { TypedMap } from '@graphprotocol/graph-ts/common/collections'

import { Prime as PrimeEntity } from '../generated/schema'
import {
  Primes,
  Primes__getPrimeFactorsInput_numberDataStruct,
} from '../generated/Primes/Primes'
import { base64 } from './base64'
import { Account } from './Account'

export namespace Prime {
  function decodeTokenURI(tokenURI: string): TypedMap<string, JSONValue> {
    let decoded = base64.decode(
      tokenURI.split('data:application/json;base64,')[1],
    )
    return json.fromBytes(Bytes.fromUint8Array(decoded)).toObject()
  }

  export function getOrCreate(id: BigInt, primesAddress: Address): PrimeEntity {
    let primeEntity = PrimeEntity.load(id.toString())

    if (primeEntity != null) {
      return primeEntity as PrimeEntity
    }

    let primes = Primes.bind(primesAddress)

    primeEntity = new PrimeEntity(id.toString())
    primeEntity.number = id.toI32()

    // Attributes in order, default to false
    primeEntity.taxicabNumber = false
    primeEntity.perfectNumber = false
    primeEntity.eulersLuckyNumber = false
    primeEntity.uniquePrime = false
    primeEntity.friendlyNumber = false
    primeEntity.colossallyAbundantNumber = false
    primeEntity.fibonacciNumber = false
    primeEntity.repdigitNumber = false
    primeEntity.weirdNumber = false
    primeEntity.triangularNumber = false
    primeEntity.sophieGermainPrime = false
    primeEntity.strongPrime = false
    primeEntity.frugalNumber = false
    primeEntity.squareNumber = false
    primeEntity.emirp = false
    primeEntity.magicNumber = false
    primeEntity.luckyNumber = false
    primeEntity.goodPrime = false
    primeEntity.happyNumber = false
    primeEntity.untouchableNumber = false
    primeEntity.semiperfectNumber = false
    primeEntity.harshadNumber = false
    primeEntity.evilNumber = false

    primeEntity.revealed = false
    primeEntity = updateAttributes(primeEntity, primesAddress)

    primeEntity.owner = Account.getOrCreate(primes.ownerOf(id)).id

    let numberData = primes.getNumberData(id)
    primeEntity.isPrime = numberData.core.isPrime
    primeEntity.primeIndex = numberData.core.primeIndex
    primeEntity.primeFactorCount = numberData.core.primeFactorCount

    let primeIdx = BigInt.fromI32(numberData.core.primeIndex)
    let twins = primes.twins(primeIdx)
    let cousins = primes.cousins(primeIdx)
    let sexyPrimes = primes.sexyPrimes(primeIdx)

    let twinsArr = [] as string[]
    let cousinsArr = [] as string[]
    let sexyPrimesArr = [] as string[]

    if (primeEntity.isPrime) {
      for (let i = 0; i < sexyPrimes.length; i++) {
        if (sexyPrimes[i] == 0) {
          continue
        }
        sexyPrimesArr.push(sexyPrimes[i].toString())
      }

      for (let i = 0; i < cousins.length; i++) {
        if (cousins[i] == 0) {
          continue
        }
        cousinsArr.push(cousins[i].toString())
      }

      for (let i = 0; i < twins.length; i++) {
        if (twins[i] == 0) {
          continue
        }
        twinsArr.push(twins[i].toString())
      }
    }

    primeEntity.twins = twinsArr
    primeEntity.cousins = cousinsArr
    primeEntity.sexyPrimes = sexyPrimesArr

    let numberData_ =
      // @ts-ignore
      changetype<Primes__getPrimeFactorsInput_numberDataStruct>(numberData)

    let primeFactors = primes.getPrimeFactors(id.toU32(), numberData_)

    primeEntity.primeFactors = []
    for (let i = 0; i < primeFactors.length; i++) {
      primeEntity.primeFactors[i] = primeFactors[i]
    }

    primeEntity.parent1 = numberData.core.parents[0].toString()
    primeEntity.parent2 = numberData.core.parents[1].toString()
    primeEntity.lastBred = numberData.core.lastBred

    // Renting
    let rentalData = primes.rental(id).toMap()

    primeEntity.isListed = false

    primeEntity.isRentable = false
    if (rentalData.isSet('isRentable')) {
      primeEntity.isRentable = rentalData.get('isRentable')!.toBoolean()
    }

    primeEntity.whitelistOnly = false
    if (rentalData.isSet('whitelistOnly')) {
      primeEntity.whitelistOnly = rentalData.get('whitelistOnly')!.toBoolean()
    }

    if (rentalData.isSet('studFee')) {
      primeEntity.studFee = rentalData.get('studFee')!.toBigInt()
    }

    if (rentalData.isSet('deadline')) {
      primeEntity.deadline = rentalData.get('deadline')!.toBigInt()
    }

    primeEntity.suitors = []
    let suitorsArr = primes.getSuitors(id)
    for (let i = 0; i < suitorsArr.length; i++) {
      primeEntity.suitors[i] = suitorsArr[i].toString()
    }

    primeEntity.save()

    return primeEntity as PrimeEntity
  }

  export function updateAttributes(
    primeEntity: PrimeEntity,
    primesAddress: Address,
  ): PrimeEntity {
    let primes = Primes.bind(primesAddress)

    let tokenURI = primes.tokenURI(BigInt.fromString(primeEntity.id))
    let tokenURIObj = decodeTokenURI(tokenURI)
    primeEntity.image = tokenURIObj.get('image')!.toString()

    let attributes = tokenURIObj.get('attributes')!.toArray()
    for (let i = 0; i < attributes.length; i++) {
      let obj = attributes[i].toObject()

      if (obj.isSet('value')) {
        let attributeName = obj.get('value')!.toString()

        if (attributeName == 'Taxicab Number') {
          primeEntity.taxicabNumber = true
        } else if (attributeName == 'Perfect Number') {
          primeEntity.perfectNumber = true
        } else if (attributeName == "Euler's Lucky Numbers") {
          primeEntity.eulersLuckyNumber = true
        } else if (attributeName == 'Unique Prime') {
          primeEntity.uniquePrime = true
        } else if (attributeName == 'Friendly Number') {
          primeEntity.friendlyNumber = true
        } else if (attributeName == 'Colossally Abundant Number') {
          primeEntity.colossallyAbundantNumber = true
        } else if (attributeName == 'Fibonacci Number') {
          primeEntity.fibonacciNumber = true
        } else if (attributeName == 'Repdigit Number') {
          primeEntity.repdigitNumber = true
        } else if (attributeName == 'Weird Number') {
          primeEntity.weirdNumber = true
        } else if (attributeName == 'Triangular Number') {
          primeEntity.triangularNumber = true
        } else if (attributeName == 'Sophie Germain Prime') {
          primeEntity.sophieGermainPrime = true
        } else if (attributeName == 'Strong Prime') {
          primeEntity.strongPrime = true
        } else if (attributeName == 'Frugal Number') {
          primeEntity.frugalNumber = true
        } else if (attributeName == 'Square Number') {
          primeEntity.squareNumber = true
        } else if (attributeName == 'EMIRP') {
          primeEntity.emirp = true
        } else if (attributeName == 'Magic Number') {
          primeEntity.magicNumber = true
        } else if (attributeName == 'Lucky Number') {
          primeEntity.luckyNumber = true
        } else if (attributeName == 'Good Prime') {
          primeEntity.goodPrime = true
        } else if (attributeName == 'Happy Number') {
          primeEntity.happyNumber = true
        } else if (attributeName == 'Untouchable Number') {
          primeEntity.untouchableNumber = true
        } else if (attributeName == 'Semiperfect Number') {
          primeEntity.semiperfectNumber = true
        } else if (attributeName == 'Harshad Number') {
          primeEntity.harshadNumber = true
        } else if (attributeName == 'Evil Number') {
          primeEntity.evilNumber = true
        }
      }
    }
    return primeEntity
  }
}
