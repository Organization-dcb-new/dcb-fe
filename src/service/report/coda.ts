import { CodaTelcoRow } from '../../templates/pdf-report/coda/telco'
import type { ReportData } from '../../types/report'

interface TelcoPrice {
  basicPrice: number
  payoutToCoda: number
  eupCharging: number
}

const TELCO_PRICE: Record<number, TelcoPrice> = {
  1000: {
    basicPrice: 901,
    payoutToCoda: 703,
    eupCharging: 1110,
  },
  2000: {
    basicPrice: 1802,
    payoutToCoda: 1405,
    eupCharging: 2220,
  },
  3000: {
    basicPrice: 2703,
    payoutToCoda: 2108,
    eupCharging: 3330,
  },
  5000: {
    basicPrice: 4505,
    payoutToCoda: 3514,
    eupCharging: 5550,
  },
  10000: {
    basicPrice: 9009,
    payoutToCoda: 7027,
    eupCharging: 11100,
  },
  15000: {
    basicPrice: 13514,
    payoutToCoda: 10541,
    eupCharging: 16650,
  },
  20000: {
    basicPrice: 18018,
    payoutToCoda: 14054,
    eupCharging: 22200,
  },
  25000: {
    basicPrice: 22523,
    payoutToCoda: 17568,
    eupCharging: 27750,
  },
  30000: {
    basicPrice: 27027,
    payoutToCoda: 21081,
    eupCharging: 33300,
  },
  40000: {
    basicPrice: 36036,
    payoutToCoda: 28108,
    eupCharging: 44400,
  },
  50000: {
    basicPrice: 45045,
    payoutToCoda: 35135,
    eupCharging: 55500,
  },
  60000: {
    basicPrice: 54054,
    payoutToCoda: 42162,
    eupCharging: 66600,
  },
  70000: {
    basicPrice: 63063,
    payoutToCoda: 49189,
    eupCharging: 77700,
  },
  100000: {
    basicPrice: 90090,
    payoutToCoda: 70270,
    eupCharging: 111000,
  },
  125000: {
    basicPrice: 112613,
    payoutToCoda: 87838,
    eupCharging: 138750,
  },
  200000: {
    basicPrice: 180180,
    payoutToCoda: 140541,
    eupCharging: 222000,
  },
  250000: {
    basicPrice: 225225,
    payoutToCoda: 175676,
    eupCharging: 277500,
  },
  325000: {
    basicPrice: 292793,
    payoutToCoda: 228378,
    eupCharging: 360750,
  },
  500000: {
    basicPrice: 450450,
    payoutToCoda: 351351,
    eupCharging: 555000,
  },
}

export function calculateCodaTsel(data: ReportData): CodaTelcoRow[] {
  const parsed: CodaTelcoRow[] = data.summaries
    .flatMap((item): CodaTelcoRow[] => {
      const denom = item.amount
      const price = TELCO_PRICE[denom]

      if (!price) {
        return []
      }

      const nilaiTrx = TELCO_PRICE[denom].eupCharging
      const basePrice = TELCO_PRICE[denom].basicPrice
      const diskonPenyedia = Math.round(TELCO_PRICE[denom].basicPrice * 0.22)
      const codaSum = TELCO_PRICE[denom].payoutToCoda

      return [
        {
          nilaiTransaksi: nilaiTrx,
          basicPrice: basePrice,
          diskonPenyedia: diskonPenyedia,
          codaSum: codaSum,
          jumlahTransaksi: item.count,
          // payoutToCoda: basePrice * 0.78 * item.count,
          payoutToCoda: Math.trunc((basePrice * 0.78) * item.count),
          denomination: item.amount,
        },
      ]
    })
    .filter((item) => !Array.isArray(item))

  return parsed
}
