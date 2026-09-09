import { createColumnHelper } from '@tanstack/table-core'

export interface CodaTelcoRow {
  nilaiTransaksi: number
  basicPrice: number
  diskonPenyedia: number
  codaSum: number
  jumlahTransaksi: number
  payoutToCoda: number
  denomination: number
}

const column = createColumnHelper<CodaTelcoRow>()

const numFmt = Intl.NumberFormat('id-ID')

export const template = [
  column.accessor('nilaiTransaksi', {
    header: 'Nilai Transaksi',
    cell: (info) => numFmt.format(info.getValue()),
  }),
  column.accessor('denomination', {
    header: 'Denomination',
    cell: (info) => numFmt.format(info.getValue()),
  }),
  column.accessor('basicPrice', {
    header: 'Basic Price',
    cell: (info) => numFmt.format(info.getValue()),
  }),
  column.accessor('diskonPenyedia', {
    header: 'Diskon Penyedia',
    cell: (info) => numFmt.format(info.getValue()),
  }),

  column.accessor('codaSum', {
    header: 'Coda Sum',
    cell: (info) => numFmt.format(info.getValue()),
  }),

  column.accessor('jumlahTransaksi', {
    header: 'Jumlah Transaksi',
    cell: (info) => numFmt.format(info.getValue()),
    footer: () => 'TOTAL PAYOUT',
  }),

  column.accessor('payoutToCoda', {
    header: 'Payout to Coda',
    cell: (info) => numFmt.format(info.getValue()),
    footer: ({ table }) => {
      const total = table.getFilteredRowModel().rows.reduce((sum, row) => {
        return sum + Number(row.getValue('payoutToCoda') || 0)
      }, 0)
      return `IDR ${numFmt.format(total)}`
    },
  }),
]
