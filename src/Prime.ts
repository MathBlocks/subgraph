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

    primeEntity = updateAttributes(primeEntity, primesAddress)

    primeEntity.owner = Account.getOrCreate(primes.ownerOf(id)).id

    let numberData = primes.getNumberData(id)
    primeEntity.isPrime = numberData.core.isPrime
    primeEntity.primeIndex = numberData.core.primeIndex
    primeEntity.primeFactorCount = numberData.core.primeFactorCount

    primeEntity.sexyPrimes = []
    primeEntity.cousins = []
    primeEntity.twins = []

    if (primeEntity.isPrime) {
      let sexyPrimesArr = numberData.prime.sexyPrimes
      for (let i = 0; i < sexyPrimesArr.length; i++) {
        primeEntity.sexyPrimes[i] = sexyPrimesArr[i].toString()
      }

      let cousinsArr = numberData.prime.cousins
      for (let i = 0; i < cousinsArr.length; i++) {
        primeEntity.cousins[i] = cousinsArr[i].toString()
      }

      let twinsArr = numberData.prime.twins
      for (let i = 0; i < twinsArr.length; i++) {
        primeEntity.twins[i] = twinsArr[i].toString()
      }
    }

    let numberData_ =
      // @ts-ignore
      changetype<Primes__getPrimeFactorsInput_numberDataStruct>(numberData)
    let primeFactorsArr = primes.getPrimeFactors(id.toU32(), numberData_)
    primeEntity.primeFactors = []
    for (let i = 0; i < primeFactorsArr.length; i++) {
      primeEntity.primeFactors[i] = primeFactorsArr[i].toString()
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
    if (rentalData.isSet('suitors')) {
      let suitorsArr = rentalData.get('suitors')!.toBigIntArray()
      for (let i = 0; i < suitorsArr.length; i++) {
        primeEntity.suitors[i] = suitorsArr[i].toString()
      }
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

        if (
          attributeName == 'Attribute1' ||
          attributeName == 'Taxicab Number'
        ) {
          primeEntity.taxicabNumber = true
        } else if (
          attributeName == 'Attribute2' ||
          attributeName == 'Perfect Number'
        ) {
          primeEntity.perfectNumber = true
        } else if (
          attributeName == 'Attribute3' ||
          attributeName == "Euler's Lucky Numbers"
        ) {
          primeEntity.eulersLuckyNumber = true
        } else if (
          attributeName == 'Attribute4' ||
          attributeName == 'Unique Prime'
        ) {
          primeEntity.uniquePrime = true
        } else if (
          attributeName == 'Attribute5' ||
          attributeName == 'Friendly Number'
        ) {
          primeEntity.friendlyNumber = true
        } else if (
          attributeName == 'Attribute6' ||
          attributeName == 'Colossally Abundant Number'
        ) {
          primeEntity.colossallyAbundantNumber = true
        } else if (
          attributeName == 'Attribute7' ||
          attributeName == 'Fibonacci Number'
        ) {
          primeEntity.fibonacciNumber = true
        } else if (
          attributeName == 'Attribute8' ||
          attributeName == 'Repdigit Number'
        ) {
          primeEntity.repdigitNumber = true
        } else if (
          attributeName == 'Attribute9' ||
          attributeName == 'Weird Number'
        ) {
          primeEntity.weirdNumber = true
        } else if (
          attributeName == 'Attribute10' ||
          attributeName == 'Triangular Number'
        ) {
          primeEntity.triangularNumber = true
        } else if (
          attributeName == 'Attribute11' ||
          attributeName == 'Sophie Germain Prime'
        ) {
          primeEntity.sophieGermainPrime = true
        } else if (
          attributeName == 'Attribute12' ||
          attributeName == 'Strong Prime'
        ) {
          primeEntity.strongPrime = true
        } else if (
          attributeName == 'Attribute13' ||
          attributeName == 'Frugal Number'
        ) {
          primeEntity.frugalNumber = true
        } else if (
          attributeName == 'Attribute14' ||
          attributeName == 'Square Number'
        ) {
          primeEntity.squareNumber = true
        } else if (attributeName == 'Attribute15' || attributeName == 'EMIRP') {
          primeEntity.emirp = true
        } else if (
          attributeName == 'Attribute16' ||
          attributeName == 'Magic Number'
        ) {
          primeEntity.magicNumber = true
        } else if (
          attributeName == 'Attribute17' ||
          attributeName == 'Lucky Number'
        ) {
          primeEntity.luckyNumber = true
        } else if (
          attributeName == 'Attribute18' ||
          attributeName == 'Good Prime'
        ) {
          primeEntity.goodPrime = true
        } else if (
          attributeName == 'Attribute19' ||
          attributeName == 'Happy Number'
        ) {
          primeEntity.happyNumber = true
        } else if (
          attributeName == 'Attribute20' ||
          attributeName == 'Untouchable Number'
        ) {
          primeEntity.untouchableNumber = true
        } else if (
          attributeName == 'Attribute21' ||
          attributeName == 'Semiperfect Number'
        ) {
          primeEntity.semiperfectNumber = true
        } else if (
          attributeName == 'Attribute22' ||
          attributeName == 'Harshad Number'
        ) {
          primeEntity.harshadNumber = true
        } else if (
          attributeName == 'Attribute23' ||
          attributeName == 'Evil Number'
        ) {
          primeEntity.evilNumber = true
        }
      }
    }
    return primeEntity
  }
}
