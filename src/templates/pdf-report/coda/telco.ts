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

export const template = [
  column.accessor('nilaiTransaksi', {
    header: 'Nilai Transaksi',
    cell: (info) => info.getValue(),
  }),
  column.accessor('denomination', {
    header: 'Denomination',
    cell: (info) => info.getValue(),
  }),
  column.accessor('basicPrice', {
    header: 'Basic Price',
    cell: (info) => info.getValue(),
  }),
  column.accessor('diskonPenyedia', {
    header: 'Diskon Penyedia',
    cell: (info) => info.getValue(),
  }),

  column.accessor('codaSum', {
    header: 'Coda Sum',
    cell: (info) => info.getValue(),
  }),

  column.accessor('jumlahTransaksi', {
    header: 'Jumlah Transaksi',
    cell: (info) => info.getValue(),
  }),

  column.accessor('payoutToCoda', {
    header: 'Payout to Coda',
    cell: (info) => info.getValue(),
    footer: ({ table }) => {
      const total = table.getFilteredRowModel().rows.reduce((sum, row) => {
        return sum + Number(row.getValue('payoutToCoda') || 0)
      }, 0)
      return total
    },
  }),
]
