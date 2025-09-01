// Form component for adding and updating actions
import { Button, Form, Input, DatePicker, InputNumber} from 'antd';

const FormComponent = ({onFinish, initialValues, form}) => {

    return (
        <div>
            <Form form={form} onFinish={onFinish} initialValues={initialValues}>
                <Form.Item name="action" rules={[{ required: true, message: 'Please input the action!' }]}>
                    <Input placeholder="Action" />
                </Form.Item>
                <Form.Item name="date" rules={[{ required: true, message: 'Please input the date!' }]}>
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="points" rules={[{ required: true, message: 'Please input the points! Has to be a number!' }]}>
                    <InputNumber style={{ width: '100%' }} placeholder="Points" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default FormComponent;
