import { useEffect, useState } from 'react'

import MerchantForm, { MerchantFormValues } from './MerchantForm'
import { Button, Form, Modal } from 'antd'

interface Props {
  id: string
  data: MerchantListDataModel
}

const EditMerchant = ({ id, data }: Props) => {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const [form] = Form.useForm<MerchantFormValues>()

  const handleReset = () => {
    form.resetFields()
  }

  const handleSubmit = (values: MerchantFormValues) => {
    console.log('submit', { id, values })
  }

  useEffect(() => {
    form.setFieldsValue({
      merchant_code: undefined,
      secret_key: data.clientSecret,
      uid: data.uid,
      merchant_name: data.clientName,
      address: undefined,
      phone: data.phone,
      email: data.email,
    })
  }, [])

  return (
    <>
      <button type='button' onClick={handleOpen}>
        Edit
      </button>
      <Modal
        title='Edit Merchant'
        width='60%'
        open={open}
        onCancel={handleClose}
        footer={[
          <Button key='cancel' onClick={handleClose}>
            Cancel
          </Button>,
          <Button key='reset' danger variant='outlined' onClick={handleReset}>
            Reset
          </Button>,
          <Button key='submit' type='primary' htmlType='submit'>
            Edit
          </Button>,
        ]}
        modalRender={(dom) => (
          <Form name='edit_merchant' form={form} layout='vertical' onFinish={handleSubmit}>
            {dom}
          </Form>
        )}
      >
        <MerchantForm />
      </Modal>
    </>
  )
}

export default EditMerchant
