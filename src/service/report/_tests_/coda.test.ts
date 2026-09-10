import { calculateCodaTsel } from '../coda'
import { describe, expect, it } from 'vitest'
import type { CodaTelcoRow } from '../../../templates/pdf-report/coda/telco'

describe('calculateCodaTsel', () => {
  it('harus menghitung baris kalkulasi sesuai dengan mapping TELCO_PRICE', () => {
    const mockReportData = {
      summaries: [{ amount: 2000, count: 5 }],
    }

    const expectedOutput: CodaTelcoRow[] = [
      {
        denomination: 2000,
        nilaiTransaksi: 2220,
        basicPrice: 1802,
        diskonPenyedia: 396,
        codaSum: 1405,
        jumlahTransaksi: 5,
        payoutToCoda: 7027,
      },
    ]

    const result = calculateCodaTsel(mockReportData as any)

    expect(result).toEqual(expectedOutput)
  })

  it('harus menggunakan amount sebagai denomination', () => {
    const mockReportData = {
      summaries: [{ amount: 10000, count: 628 }],
    }

    const result = calculateCodaTsel(mockReportData as any)

    expect(result).toEqual([
      {
        denomination: 10000,
        nilaiTransaksi: 11100,
        basicPrice: 9009,
        diskonPenyedia: 1982,
        codaSum: 7027,
        jumlahTransaksi: 628,
        payoutToCoda: 4_412_968,
      },
    ])
  })
  it('harus menggunakan amount sebagai denomination', () => {
    const mockReportData = {
      summaries: [{ amount: 10000, count: 628 }],
    }

    const result = calculateCodaTsel(mockReportData as any)

    expect(result).toEqual([
      {
        denomination: 10000,
        nilaiTransaksi: 11100,
        basicPrice: 9009,
        diskonPenyedia: 1982,
        codaSum: 7027,
        jumlahTransaksi: 628,
        payoutToCoda: 4_412_968,
      },
    ])
  })

  it('harus skip denomination yang tidak tersedia di TELCO_PRICE', () => {
    const mockReportData = {
      summaries: [
        { amount: 4000, count: 10 }, // tidak ada
      ],
    }

    const result = calculateCodaTsel(mockReportData as any)

    expect(result).toEqual([
    ])
  })
  it('harus skip denomination yang tidak tersedia di TELCO_PRICE', () => {
    const mockReportData = {
      summaries: [
        { amount: 2000, count: 5 },
        { amount: 4000, count: 10 }, // tidak ada
        { amount: 5000, count: 432 },
      ],
    }

    const result = calculateCodaTsel(mockReportData as any)

    expect(result).toEqual([
      {
        denomination: 2000,
        nilaiTransaksi: 2220,
        basicPrice: 1802,
        diskonPenyedia: 396,
        codaSum: 1405,
        jumlahTransaksi: 5,
        payoutToCoda: 7027,
      },
      {
        denomination: 5000,
        nilaiTransaksi: 5550,
        basicPrice: 4505,
        diskonPenyedia: 991,
        codaSum: 3514,
        jumlahTransaksi: 432,
        payoutToCoda: 1518004,
      },
    ])
  })

  it('harus skip semua summary jika denomination tidak tersedia', () => {
    const mockReportData = {
      summaries: [
        { amount: 4000, count: 10 },
        { amount: 6000, count: 5 },
        { amount: 7000, count: 2 },
      ],
    }

    const result = calculateCodaTsel(mockReportData as any)

    expect(result).toEqual([])
  })

  it('harus menghitung total payoutToCoda dari denomination yang valid saja', () => {
    const mockReportData = {
      summaries: [
        { amount: 2000, count: 5 },
        { amount: 5000, count: 2 },
        { amount: 10000, count: 3 },
        { amount: 4000, count: 10 }, // skip
      ],
    }

    const result = calculateCodaTsel(mockReportData as any)
    const totalPayout = result.reduce((sum: number, row: any) => sum + row.payoutToCoda, 0)

    expect(totalPayout).toBe(
      Math.trunc((1802 * 0.78) * 5) + Math.trunc((4505 * 0.78) * 2) + Math.trunc((9009 * 0.78) * 3)
    )
  })
  it('should rounding down truncate', () => {
    const mockReportData = {
      summaries: [
        { amount: 500_000, count: 7 },
        { amount: 5_000, count: 432 },
        { amount: 10_000, count: 628 }
      ],
    }

    const result = calculateCodaTsel(mockReportData as any)

    expect(result).toEqual([
      {
        denomination: 500000,
        nilaiTransaksi: 555000,
        basicPrice: 450450,
        diskonPenyedia: 99099,
        codaSum: 351351,
        jumlahTransaksi: 7,
        payoutToCoda: 2_459_457,
      },
      {
        denomination: 5000,
        nilaiTransaksi: 5550,
        basicPrice: 4505,
        diskonPenyedia: 991,
        codaSum: 3514,
        jumlahTransaksi: 432,
        payoutToCoda: 1518004,
      },
      {
        denomination: 10000,
        nilaiTransaksi: 11100,
        basicPrice: 9009,
        diskonPenyedia: 1982,
        codaSum: 7027,
        jumlahTransaksi: 628,
        payoutToCoda: 4412968,
      },
    ])
  })
})
