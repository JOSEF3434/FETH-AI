import { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Modal,
  Tag,
  DatePicker,
  Space,
  message,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

const PaymentHistoryManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);

  // Fetch payment data (replace with your API call)
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token"); // Get token from localStorage
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          "http://localhost:4000/api/payments/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Authentication failed. Please login again.");
          }
          throw new Error("Failed to fetch payment history");
        }

        const data = await response.json();
        setPayments(Array.isArray(data) ? data : []);
        setFilteredPayments(Array.isArray(data) ? data : []);
      } catch (error) {
        message.error(error.message || "Failed to fetch payment history");
        setPayments([]);
        setFilteredPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...payments];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((payment) => payment.status === statusFilter);
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const start = moment(dateRange[0]).startOf("day");
      const end = moment(dateRange[1]).endOf("day");
      result = result.filter((payment) =>
        moment(payment.date).isBetween(start, end, null, "[]")
      );
    }

    // Search filter
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(
        (payment) =>
          payment.transactionId?.toLowerCase().includes(lowerSearch) ||
          payment.userName?.toLowerCase().includes(lowerSearch) ||
          payment.lawyerName?.toLowerCase().includes(lowerSearch) ||
          payment.amount?.toString().includes(searchText)
      );
    }

    setFilteredPayments(result);
    setPagination({ ...pagination, current: 1 });
  }, [payments, statusFilter, dateRange, searchText]);

  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      sorter: (a, b) => a.transactionId?.localeCompare(b.transactionId),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => (date ? moment(date).format("YYYY-MM-DD HH:mm") : "-"),
      sorter: (a, b) => moment(a.date) - moment(b.date),
    },
    {
      title: "User",
      dataIndex: "userName",
      key: "userName",
      sorter: (a, b) => a.userName?.localeCompare(b.userName),
    },
    {
      title: "Lawyer",
      dataIndex: "lawyerName",
      key: "lawyerName",
      sorter: (a, b) => a.lawyerName?.localeCompare(b.lawyerName),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (amount ? `$${amount.toFixed(2)}` : "-"),
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "";
        switch (status) {
          case "completed":
            color = "green";
            break;
          case "pending":
            color = "orange";
            break;
          case "failed":
            color = "red";
            break;
          case "refunded":
            color = "blue";
            break;
          default:
            color = "gray";
        }
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
      filters: [
        { text: "Completed", value: "completed" },
        { text: "Pending", value: "pending" },
        { text: "Failed", value: "failed" },
        { text: "Refunded", value: "refunded" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedPayment(record);
            setIsModalOpen(true);
          }}
        >
          Details
        </Button>
      ),
    },
  ];

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(newPagination);
  };

  const exportToCSV = () => {
    // Implement CSV export functionality
    message.success("Exporting payment history to CSV");
  };

  const resetFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setDateRange([]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Payment History Management</h2>
        <div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportToCSV}
          >
            Export to CSV
          </Button>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <Space size="large" wrap>
          <Input
            placeholder="Search transactions..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />

          <Select
            placeholder="Filter by status"
            style={{ width: 180 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="all">All Statuses</Option>
            <Option value="completed">Completed</Option>
            <Option value="pending">Pending</Option>
            <Option value="failed">Failed</Option>
            <Option value="refunded">Refunded</Option>
          </Select>

          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            onChange={setDateRange}
            value={dateRange}
          />

          <Button icon={<FilterOutlined />} onClick={resetFilters}>
            Reset Filters
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredPayments}
        rowKey="transactionId"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: true }}
      />

      <Modal
        title="Payment Details"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedPayment && (
          <div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <span style={{ fontWeight: 500, minWidth: "150px" }}>
                Transaction ID:
              </span>
              <span>{selectedPayment.transactionId || "-"}</span>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <span style={{ fontWeight: 500, minWidth: "150px" }}>Date:</span>
              <span>
                {selectedPayment.date
                  ? moment(selectedPayment.date).format("YYYY-MM-DD HH:mm:ss")
                  : "-"}
              </span>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <span style={{ fontWeight: 500, minWidth: "150px" }}>
                Status:
              </span>
              <Tag
                color={
                  selectedPayment.status === "completed"
                    ? "green"
                    : selectedPayment.status === "pending"
                    ? "orange"
                    : "red"
                }
              >
                {selectedPayment.status?.toUpperCase()}
              </Tag>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <span style={{ fontWeight: 500, minWidth: "150px" }}>User:</span>
              <span>
                {selectedPayment.userName || "-"} (
                {selectedPayment.userEmail || "-"})
              </span>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <span style={{ fontWeight: 500, minWidth: "150px" }}>
                Lawyer:
              </span>
              <span>
                {selectedPayment.lawyerName || "-"} (
                {selectedPayment.lawyerLicenseNumber || "-"})
              </span>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <span style={{ fontWeight: 500, minWidth: "150px" }}>
                Amount:
              </span>
              <span>
                $
                {selectedPayment.amount
                  ? selectedPayment.amount.toFixed(2)
                  : "0.00"}
              </span>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <span style={{ fontWeight: 500, minWidth: "150px" }}>
                Payment Method:
              </span>
              <span>{selectedPayment.paymentMethod || "-"}</span>
            </div>
            <div style={{ display: "flex", marginBottom: "10px" }}>
              <span style={{ fontWeight: 500, minWidth: "150px" }}>
                Appointment:
              </span>
              <span>
                {selectedPayment.appointmentReason || "-"} on{" "}
                {selectedPayment.appointmentDate
                  ? moment(selectedPayment.appointmentDate).format("YYYY-MM-DD")
                  : "-"}
              </span>
            </div>
            {selectedPayment.notes && (
              <div style={{ display: "flex", marginBottom: "10px" }}>
                <span style={{ fontWeight: 500, minWidth: "150px" }}>
                  Notes:
                </span>
                <span>{selectedPayment.notes}</span>
              </div>
            )}
            <div style={{ marginTop: "20px" }}>
              <Button type="primary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              {selectedPayment.status === "pending" && (
                <Button type="default" style={{ marginLeft: "10px" }}>
                  Mark as Completed
                </Button>
              )}
              {selectedPayment.status === "completed" && (
                <Button type="default" style={{ marginLeft: "10px" }}>
                  Process Refund
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentHistoryManagement;
