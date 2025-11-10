import { useState } from 'react'
import { Input, Button, Card, Typography, Divider, Select, message } from 'antd'

const { Title } = Typography
const { Option } = Select

export default function TransactionSimulationPage() {
  const [headers, setHeaders] = useState({
    appkey: 'h0Wq9Incnlk7-gxMn14DaA',
    appid: 'n5zrGLDpW0PT_RQXPPUWZQ',
    bodysign: '',
    appsecret: '',
  })

  const [form, setForm] = useState({
    redirect_url: 'https://merchant.com/return',
    user_id: '20250209P07V2C3477000000',
    user_mdn: '085710039744',
    merchant_transaction_id: 'TESTXSH0000011',
    payment_method: 'indosat_airtime',
    currency: 'IDR',
    amount: 10000,
    item_id: '3322',
    item_name: 'PAYMENT',
    notification_url: 'https://merchant.com/callback',
  })

  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const handleHeaderChange = (field: string, value: string) => {
    setHeaders((prev) => ({ ...prev, [field]: value }))
  }

  const handleFormChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const isFormComplete = Object.values(form).every((v) => v !== '' && v !== null && v !== undefined)
  const canGenerate = headers.appsecret.trim() !== '' && isFormComplete

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      const encoder = new TextEncoder()
      const keyData = encoder.encode(headers.appsecret)
      const data = encoder.encode(JSON.stringify(form).replace(/\\\//g, '/'))
      const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      const signature = await crypto.subtle.sign('HMAC', key, data)
      let base64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      base64 = base64.replace(/\+/g, '-').replace(/\//g, '_')
      setHeaders((prev) => ({ ...prev, bodysign: base64 }))
      setGenerated(true)
      message.success('✅ BodySign generated successfully!')
    } catch (err) {
      message.error('Failed to generate BodySign.')
    } finally {
      setGenerating(false)
    }
  }

  const paymentOptions = [
    { value: 'telkomsel_airtime', label: 'Telkomsel' },
    { value: 'xl_airtime', label: 'XL' },
    { value: 'three_airtime', label: 'Tri' },
    { value: 'smartfren_airtime', label: 'Smartfren' },
    { value: 'indosat_airtime', label: 'Indosat' },
    { value: 'dana', label: 'Dana' },
    { value: 'ovo', label: 'OVO' },
    { value: 'shopeepay', label: 'ShopeePay' },
    { value: 'qris', label: 'QRIS' },
    { value: 'va_bca', label: 'BCA VA' },
    { value: 'va_bri', label: 'BRI VA' },
    { value: 'va_bni', label: 'BNI VA' },
    { value: 'va_mandiri', label: 'Mandiri VA' },
    { value: 'va_permata', label: 'Permata VA' },
    { value: 'va_sinarmas', label: 'Sinarmas VA' },
    { value: 'alfamart_otc', label: 'Alfamart' },
    { value: 'indomaret_otc', label: 'Indomaret' },
    { value: 'visa_master', label: 'Credit Card' },
  ]

  const currencyOptions = [
    { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'PHP', label: 'PHP - Philippine Peso' },
    { value: 'SGD', label: 'SGD - Singapore Dollar' },
    { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  ]

  const handleSimulate = () => {
    message.success('✅ Simulation complete (no API hit).')
    setShowResult(true)
  }

  const mockResponse = {
    success: true,
    retcode: '0000',
    message: 'Successful',
    data: {
      token: '56f2c280891e40257c8b4577',
    },
  }

  return (
    <div className='min-h-screen flex justify-center items-center bg-gray-50 p-5'>
      <Card className='w-full max-w-6xl shadow-md border border-gray-200 rounded-xl'>
        <div className='text-center mb-6'>
          <Title level={3}>Transaction Simulation</Title>
        </div>

        {/* Header Section */}
        <div className='mb-6'>
          <Title level={5} className='mb-3 text-blue-600'>
            🔐 Authentication Headers
          </Title>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='text-gray-700 mb-1 font-medium block'>App Key</label>
              <Input value={headers.appkey} size='large' disabled />
            </div>

            <div>
              <label className='text-gray-700 mb-1 font-medium block'>App ID</label>
              <Input value={headers.appid} size='large' disabled />
            </div>

            <div>
              <label className='text-gray-700 mb-1 font-medium block'>Body Sign</label>
              <div className='flex gap-2'>
                <Input
                  placeholder='Generated via HMAC SHA-256'
                  value={headers.bodysign}
                  onChange={(e) => {
                    handleHeaderChange('bodysign', e.target.value)
                    setGenerated(false)
                  }}
                  size='large'
                  className='flex-1'
                />
                <Button
                  type='primary'
                  size='large'
                  onClick={handleGenerate}
                  disabled={!canGenerate || generating || generated}
                  loading={generating}
                >
                  {generated ? 'Generated' : 'Generate'}
                </Button>
              </div>
            </div>

            <div>
              <label className='text-gray-700 mb-1 font-medium block'>App Secret</label>
              <Input.Password
                placeholder='App Secret'
                value={headers.appsecret}
                onChange={(e) => handleHeaderChange('appsecret', e.target.value)}
                size='large'
              />
            </div>
          </div>
        </div>

        <Divider />

        {/* Transaction Form */}
        <div>
          <Title level={5} className='mb-3 text-blue-600'>
            💳 Transaction Data
          </Title>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Redirect URL */}
            <div>
              <label className='text-gray-700 mb-1 font-medium block'>Redirect URL</label>
              <Input
                value={form.redirect_url}
                onChange={(e) => handleFormChange('redirect_url', e.target.value)}
                size='large'
              />
            </div>

            {/* User ID */}
            <div>
              <label className='text-gray-700 mb-1 font-medium block'>User ID</label>
              <Input value={form.user_id} onChange={(e) => handleFormChange('user_id', e.target.value)} size='large' />
            </div>

            {/* User MDN */}
            <div>
              <label className='text-gray-700 mb-1 font-medium block'>User MDN</label>
              <Input
                value={form.user_mdn}
                onChange={(e) => handleFormChange('user_mdn', e.target.value)}
                size='large'
              />
            </div>

            {/* Merchant Transaction ID */}
            <div>
              <label className='text-gray-700 mb-1 font-medium block'>Merchant Transaction ID</label>
              <Input
                value={form.merchant_transaction_id}
                onChange={(e) => handleFormChange('merchant_transaction_id', e.target.value)}
                size='large'
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className='text-gray-700 mb-1 font-medium block'>Payment Method</label>
              <Select
                value={form.payment_method}
                onChange={(val) => handleFormChange('payment_method', val)}
                size='large'
                className='w-full'
              >
                {paymentOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Currency */}
            <div>
              <label className='text-gray-700 mb-1 font-medium block'>Currency</label>
              <Select
                value={form.currency}
                onChange={(val) => handleFormChange('currency', val)}
                size='large'
                className='w-full'
              >
                {currencyOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Amount */}
            <div>
              <label className='text-gray-700 mb-1 font-medium block'>Amount</label>
              <Input
                value={form.amount}
                onChange={(e) => handleFormChange('amount', e.target.value)}
                size='large'
                type='number'
              />
            </div>

            {/* Item ID */}
            <div>
              <label className='text-gray-700 mb-1 font-medium block'>Item ID</label>
              <Input value={form.item_id} onChange={(e) => handleFormChange('item_id', e.target.value)} size='large' />
            </div>

            {/* Item Name */}
            <div>
              <label className='text-gray-700 mb-1 font-medium block'>Item Name</label>
              <Input
                value={form.item_name}
                onChange={(e) => handleFormChange('item_name', e.target.value)}
                size='large'
              />
            </div>

            {/* Notification URL */}
            <div>
              <label className='text-gray-700 mb-1 font-medium block'>Notification URL</label>
              <Input
                value={form.notification_url}
                onChange={(e) => handleFormChange('notification_url', e.target.value)}
                size='large'
              />
            </div>
          </div>
        </div>

        {/* Simulate Button */}
        <Button
          type='primary'
          size='large'
          className='mt-6 w-full'
          style={{ borderRadius: 8 }}
          disabled={!headers.bodysign}
          onClick={handleSimulate}
        >
          Simulate Transaction
        </Button>

        {/* Result Preview */}
        {showResult && (
          <div className='mt-6 space-y-6'>
            {/* Request */}
            <div className='bg-gray-900 text-green-300 p-4 rounded-lg overflow-auto'>
              <Title level={5} className='text-white mb-2'>
                🧾 Request Preview
              </Title>
              <pre className='text-sm whitespace-pre-wrap'>
                {`{
  "headers": ${JSON.stringify(
    {
      appkey: headers.appkey,
      appid: headers.appid,
      bodysign: headers.bodysign,
    },
    null,
    2,
  )},
  "body": ${JSON.stringify(form, null, 2)}
}`}
              </pre>
            </div>

            {/* Response */}
            <div className='bg-gray-900 text-blue-300 p-4 rounded-lg overflow-auto'>
              <Title level={5} className='text-white mb-2'>
                📩 Mock Response
              </Title>
              <pre className='text-sm whitespace-pre-wrap'>{JSON.stringify(mockResponse, null, 2)}</pre>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
