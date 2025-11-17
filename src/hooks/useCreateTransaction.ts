import { useMutation } from '@tanstack/react-query'
import { message } from 'antd'

interface CreateTransactionResponse {
  status: string
  message: string
  data?: any
}

interface CreateTransactionRequest {
  form: Record<string, any>
  headers: {
    appkey: string
    appid: string
    bodysign: string
  }
  apiUrl: string
}

const createTransaction = async ({
  form,
  headers,
  apiUrl,
}: CreateTransactionRequest): Promise<CreateTransactionResponse> => {
  const res = await fetch(`${apiUrl}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      appkey: headers.appkey,
      appid: headers.appid,
      bodysign: headers.bodysign,
    },
    body: JSON.stringify(form),
  })

  const data = await res.json()

  return {
    status: data?.status ?? 'error',
    message: data?.message ?? 'Something went wrong',
    data: data?.data,
  }
}

export const useCreateTransaction = () => {
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: (data: any) => {
      if (data.status !== 'success') {
        message.error('Transaction Failed')
        return
      }

      message.success('Transaction success!')
    },
    onError: () => {
      message.error(`Simulation failed`)
    },
  })
}
