import {useState, useEffect} from 'react';
import {Table, Space, message, Form, Drawer} from 'antd';
import axios from 'axios';
import FormComponent from './components/form';
import './App.css'
import dayjs from 'dayjs';

/* main page component 
|      <Table />         |
|      <FormComponent /> |
*/
function App() {
  const baseUrl = "http://localhost:3001/api/actions/";
  // initialize columns for actions table
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Action', dataIndex: 'action', key: 'action' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Points', dataIndex: 'points', key: 'points' },
    { title: 'Action', dataIndex: '', key: 'x',
        render: (_, record) => 
          <Space size="middle">
            <a onClick={() => handleUpdate(record)}>Update</a>
            <a onClick={() => handleDelete(record.id)}>Delete</a>
          </Space>
    },
  ];
  
  const [data, setData] = useState([]); // actions data
  const [update, setUpdate] = useState(null); // keep track of updating state
  const [refreshKey, setRefreshKey] = useState(0); // keep track of refresh key to trigger get request
  const [addform] = Form.useForm(); // use to reset form fields
  const [updateform] = Form.useForm();

  // fetch data from API with get request
  const fetchData = async () => {
    try {
      const result = await axios.get(baseUrl);
      setData(result.data.actions);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // get new data on refresh key: after adding, updating, or deleting action
  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  // handle update action in table, update state variables
  const handleUpdate = (record) => {
    setUpdate({
      ...record,
      date: record.date ? dayjs(record.date) : null,
    });
    setModalVisible(true);
    updateform.setFieldsValue({...update});
  };

  // update form fields when update state changes
  useEffect(() => {
    if (update) {
      updateform.setFieldsValue(update);
    } else {
      updateform.resetFields();
    }
  }, [update, updateform]);

  // handle update form submit, update state variables
  const handleUpdateFormSubmit = async (values) => {
    try {
      const payload = {
      ...values,
      date: values.date.format('YYYY-MM-DD'), // format to just day
      };
      const response = await axios.put(`${baseUrl}${update.id}`, payload);
      console.log(response);
      setUpdate(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      message.error('Error updating action');
      console.log(error);
    }
  };

  // handle add form submit, update refresh key to trigger get request
  const handleAddFormSubmit = async (values) => {
    try {
      const payload = {
      ...values,
      date: values.date.format('YYYY-MM-DD'), // format to just day
      };
      const response = await axios.post(baseUrl, payload);
      console.log(response)
      message.success('Action added successfully');
      addform.resetFields();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      message.error('Error adding action');
      console.log(error)
    }
  };

  // handle delete action, update refresh key to trigger get request
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${baseUrl}${id}`);
      console.log(response);
      message.success('Action deleted successfully');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      message.error('Error deleting action');
      console.log(error);
    }
  };

  const drawerClose = () => {
    setUpdate(null);
    updateform.resetFields();
  };

  return (
    <div style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <h1 style={{ textAlign: 'center' }}>Sustainability Actions</h1>
      <h2 style={{ textAlign: 'center' }}>Actions Table</h2>
      <Table columns={columns} dataSource={data} rowKey="id" />
      <Drawer
        title="Update Action"
        placement="right"     
        width={600}
        open={!!update}
        onClose={drawerClose}
      >
        <div >
          <FormComponent style={{ padding: '24px 24px 24px 24px' , width: '70%' }}
              key={update?.id ?? 'blank'}          // force remount when id changes
              form={updateform}
              onFinish={handleUpdateFormSubmit}
              initialValues={update}
          />
        </div>
      </Drawer>

      <div>
        <h2 style= {{textAlign:'center'}}>Add New Action</h2>
        <FormComponent
          form={addform}
          onFinish={handleAddFormSubmit}
          initialValues={{ action: '', date: null, points: null }}
        />
      </div>
      
    </div>
  );
};
export default App
