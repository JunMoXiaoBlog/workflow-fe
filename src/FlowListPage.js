import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Layout,
  Table,
  Button,
  Input,
  Modal,
  message,
  Select,
  Pagination,
  Spin,
  Card,
  Tag,
  Space,
  Typography,
  Tooltip,
  Badge,
  Drawer,
  Form,
  Row,
  Col,
  Statistic,
  Avatar,
  Divider,
  Empty,
  Dropdown,
  Menu,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  EyeOutlined,
  MoreOutlined,
  FilterOutlined,
  BranchesOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 自定义图标组件保持原有的SVG图标
const CustomIcons = {
  Workflow: () => (
    <svg
      viewBox="0 0 1024 1024"
      width="16"
      height="16"
      style={{ fill: "currentColor" }}
    >
      <path d="M480 384h320a96.11 96.11 0 0 0 96-96V160a96.11 96.11 0 0 0-96-96H480a96.11 96.11 0 0 0-96 96v32H224a96.11 96.11 0 0 0-96 96v160a96.11 96.11 0 0 0 96 96h576a32 32 0 0 1 32 32v160a32 32 0 0 1-32 32H640v-32a96.11 96.11 0 0 0-96-96H224a96.11 96.11 0 0 0-96 96v128a96.11 96.11 0 0 0 96 96h320a96.11 96.11 0 0 0 96-96v-32h160a96.11 96.11 0 0 0 96-96V576a96.11 96.11 0 0 0-96-96H224a32 32 0 0 1-32-32V288a32 32 0 0 1 32-32h160v32a96.11 96.11 0 0 0 96 96z m96 480a32 32 0 0 1-32 32H224a32 32 0 0 1-32-32V736a32 32 0 0 1 32-32h320a32 32 0 0 1 32 32zM448 160a32 32 0 0 1 32-32h320a32 32 0 0 1 32 32v128a32 32 0 0 1-32 32H480a32 32 0 0 1-32-32z" />
    </svg>
  ),
};

const FlowListPage = () => {
  // State management
  const [flows, setFlows] = useState([]);
  const [filteredFlows, setFilteredFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("descend");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10, // 改为5条便于测试分页
    total: 0,
  });
  const [createForm] = Form.useForm();

  // Mock data loading with more detailed data
  useEffect(() => {
    setTimeout(() => {
      const mockFlows = Array.from({ length: 100 }, (_, i) => ({
        key: `flow-${i + 1}`,
        id: `flow-${i + 1}`,
        name: `业务流程 ${i + 1}`,
        description:
          i % 3 === 0
            ? `这是业务流程 ${i + 1} 的详细描述，用于处理复杂业务逻辑和数据流转`
            : "",
        createdAt: new Date(
          Date.now() - Math.random() * 10000000000
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - Math.random() * 1000000000
        ).toISOString(),
        nodeCount: Math.floor(Math.random() * 20) + 3,
        status: Math.random() > 0.2 ? "active" : "draft",
        tags: [
          `标签${Math.floor(Math.random() * 5) + 1}`,
          Math.random() > 0.5
            ? `类型${Math.floor(Math.random() * 3) + 1}`
            : null,
        ].filter(Boolean),
        version: `v${Math.floor(Math.random() * 10) + 1}.${Math.floor(
          Math.random() * 10
        )}`,
        lastRunTime:
          Math.random() > 0.3
            ? new Date(Date.now() - Math.random() * 86400000).toISOString()
            : null,
        isRunning: Math.random() > 0.8,
        creator: `用户${Math.floor(Math.random() * 10) + 1}`,
        executionCount: Math.floor(Math.random() * 1000),
        successRate: Math.floor(Math.random() * 30) + 70,
        avgExecutionTime: Math.floor(Math.random() * 5000) + 1000,
      }));

      setFlows(mockFlows);
      setFilteredFlows(mockFlows);
      setPagination((prev) => ({ ...prev, total: mockFlows.length }));
      setLoading(false);
    }, 1000);
  }, []);

  // Enhanced filter and sort
  useEffect(() => {
    let result = [...flows];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (flow) =>
          flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (flow.description &&
            flow.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          flow.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          flow.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((flow) => flow.status === statusFilter);
    }

    setFilteredFlows(result);
    setPagination((prev) => ({ ...prev, total: result.length, current: 1 }));
  }, [flows, searchQuery, statusFilter]);

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Handle table change (sorting, pagination)
  const handleTableChange = (paginationConfig, filters, sorter) => {
    console.log("Table changed:", { paginationConfig, filters, sorter });

    // 更新分页状态
    setPagination({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      total: paginationConfig.total,
    });

    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order);
    }
  };

  // Handle selection
  const handleSelectionChange = (selectedKeys) => {
    setSelectedRowKeys(selectedKeys);
  };

  // Create new flow
  const handleCreateFlow = async (values) => {
    try {
      const newFlow = {
        key: `flow-${flows.length + 1}`,
        id: `flow-${flows.length + 1}`,
        name: values.name,
        description: values.description || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodeCount: 0,
        status: "draft",
        tags: values.tags || [],
        version: "v1.0",
        lastRunTime: null,
        isRunning: false,
        creator: "当前用户",
        executionCount: 0,
        successRate: 100,
        avgExecutionTime: 0,
      };

      setFlows((prevFlows) => [newFlow, ...prevFlows]);
      setShowCreateModal(false);
      createForm.resetFields();
      message.success("流程创建成功！");
    } catch (error) {
      message.error("创建失败，请重试");
    }
  };

  // Delete flow
  const handleDelete = (flow) => {
    Modal.confirm({
      title: "确认删除",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            您确定要删除工作流 <strong>"{flow.name}"</strong> 吗？
          </p>
          <p style={{ color: "#ff4d4f", fontSize: "12px" }}>
            此操作无法撤销，相关的运行历史也将被清除。
          </p>
        </div>
      ),
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        setFlows((prevFlows) => prevFlows.filter((f) => f.id !== flow.id));
        setSelectedRowKeys(selectedRowKeys.filter((key) => key !== flow.key));
        message.success("流程已删除");
      },
    });
  };

  // Batch delete
  const handleBatchDelete = () => {
    Modal.confirm({
      title: "批量删除",
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 个工作流吗？`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        setFlows((prevFlows) =>
          prevFlows.filter((flow) => !selectedRowKeys.includes(flow.key))
        );
        setSelectedRowKeys([]);
        message.success(`已删除 ${selectedRowKeys.length} 个工作流`);
      },
    });
  };

  // Duplicate flow
  const handleDuplicate = (flow) => {
    const newFlow = {
      ...flow,
      key: `flow-${flows.length + 1}`,
      id: `flow-${flows.length + 1}`,
      name: `${flow.name} (副本)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isRunning: false,
      executionCount: 0,
    };

    setFlows((prevFlows) => [newFlow, ...prevFlows]);
    message.success("流程已复制");
  };

  // Run flow
  const handleRun = (flow) => {
    setFlows((prevFlows) =>
      prevFlows.map((f) =>
        f.id === flow.id
          ? {
              ...f,
              isRunning: true,
              lastRunTime: new Date().toISOString(),
              status: "active",
              executionCount: f.executionCount + 1,
            }
          : f
      )
    );

    message.success("流程开始运行");

    // Simulate flow completion
    setTimeout(() => {
      setFlows((prevFlows) =>
        prevFlows.map((f) =>
          f.id === flow.id ? { ...f, isRunning: false } : f
        )
      );
      message.info("流程运行完成");
    }, 3000);
  };

  // View flow details
  const handleViewDetails = (flow) => {
    setSelectedFlow(flow);
    setShowDetailDrawer(true);
  };

  // Refresh
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success("列表已刷新");
    }, 500);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format duration
  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "draft":
        return "default";
      default:
        return "default";
    }
  };

  // Action menu for each row
  const getActionMenu = (record) => (
    <Menu>
      <Menu.Item
        key="run"
        icon={<PlayCircleOutlined />}
        onClick={() => handleRun(record)}
      >
        运行
      </Menu.Item>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => handleViewDetails(record)}
      >
        查看详情
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="duplicate"
        icon={<CopyOutlined />}
        onClick={() => handleDuplicate(record)}
      >
        复制
      </Menu.Item>
      <Menu.Item key="export" icon={<DownloadOutlined />}>
        导出
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        danger
        onClick={() => handleDelete(record)}
      >
        删除
      </Menu.Item>
    </Menu>
  );

  // Table columns
  const columns = [
    {
      title: "工作流信息",
      dataIndex: "name",
      key: "name",
      width: 300,
      sorter: true,
      render: (text, record) => (
        <div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
          >
            <CustomIcons.Workflow
              style={{ marginRight: 8, color: "#1890ff" }}
            />
            <Text strong style={{ fontSize: 14 }}>
              {text}
            </Text>
            {record.isRunning && (
              <Badge status="processing" style={{ marginLeft: 8 }} />
            )}
          </div>
          {record.description && (
            <Paragraph
              style={{
                margin: 0,
                fontSize: 12,
                color: "#666",
                maxWidth: 250,
              }}
              ellipsis={{ rows: 2, tooltip: record.description }}
            >
              {record.description}
            </Paragraph>
          )}
          <div style={{ marginTop: 4 }}>
            {record.tags.map((tag) => (
              <Tag key={tag} size="small" style={{ marginRight: 4 }}>
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      filters: [
        { text: "已激活", value: "active" },
        { text: "草稿", value: "draft" },
      ],
      render: (status, record) => (
        <div>
          <Tag color={getStatusColor(status)}>
            {status === "active" ? "已激活" : "草稿"}
          </Tag>
          {record.isRunning && (
            <Tag color="blue" icon={<ClockCircleOutlined />}>
              运行中
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "版本",
      dataIndex: "version",
      key: "version",
      width: 80,
      render: (version) => <Tag color="geekblue">{version}</Tag>,
    },
    {
      title: "节点数",
      dataIndex: "nodeCount",
      key: "nodeCount",
      width: 80,
      sorter: true,
      align: "center",
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: "#52c41a" }} />
      ),
    },
    {
      title: "执行统计",
      key: "execution",
      width: 120,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>执行 {record.executionCount} 次</div>
          <div
            style={{ color: record.successRate >= 90 ? "#52c41a" : "#faad14" }}
          >
            成功率 {record.successRate}%
          </div>
          <div style={{ color: "#666" }}>
            平均 {formatDuration(record.avgExecutionTime)}
          </div>
        </div>
      ),
    },
    {
      title: "创建者",
      dataIndex: "creator",
      key: "creator",
      width: 100,
      render: (creator) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{ marginRight: 6 }}
          />
          <Text style={{ fontSize: 12 }}>{creator}</Text>
        </div>
      ),
    },
    {
      title: "最后运行",
      dataIndex: "lastRunTime",
      key: "lastRunTime",
      width: 140,
      sorter: true,
      render: (time) => (
        <Text style={{ fontSize: 12 }}>
          {time ? formatDate(time) : "从未运行"}
        </Text>
      ),
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 140,
      sorter: true,
      defaultSortOrder: "descend",
      render: (time) => (
        <Text style={{ fontSize: 12 }}>{formatDate(time)}</Text>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="运行">
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              size="small"
              loading={record.isRunning}
              onClick={() => handleRun(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Link to="/editor">
              <Button icon={<EditOutlined />} size="small" />
            </Link>
          </Tooltip>
          <Tooltip title="查看详情">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Dropdown overlay={getActionMenu(record)} trigger={["click"]}>
            <Button icon={<MoreOutlined />} size="small" />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Get statistics
  const getStatistics = () => {
    const activeCount = flows.filter((f) => f.status === "active").length;
    const draftCount = flows.filter((f) => f.status === "draft").length;
    const runningCount = flows.filter((f) => f.isRunning).length;
    const totalExecutions = flows.reduce((sum, f) => sum + f.executionCount, 0);

    return { activeCount, draftCount, runningCount, totalExecutions };
  };

  const statistics = getStatistics();

  return (
    <Layout style={{ minHeight: "100vh", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <Sider
        width={240}
        theme="light"
        style={{ borderRight: "1px solid #f0f0f0" }}
      >
        <div
          style={{
            padding: "24px 16px",
            borderBottom: "1px solid #f0f0f0",
            textAlign: "center", // 居中对齐
          }}
        >
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            <CustomIcons.Workflow style={{ marginRight: 8 }} />
            工作流平台
          </Title>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["workflows"]}
          style={{ border: 0 }}
        >
          <Menu.Item key="workflows" icon={<BranchesOutlined />}>
            工作流列表
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main Content */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={3} style={{ margin: 0 }}>
              工作流管理
            </Title>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                刷新
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowCreateModal(true)}
              >
                新建工作流
              </Button>
            </Space>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: "24px",
            minHeight: 280,
            overflow: "auto",
            height: "calc(100vh - 64px - 48px)",
          }}
        >
          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总工作流"
                  value={flows.length}
                  prefix={<BranchesOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="已激活"
                  value={statistics.activeCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="运行中"
                  value={statistics.runningCount}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="总执行次数"
                  value={statistics.totalExecutions}
                  prefix={<PlayCircleOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Main Table Card */}
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>工作流列表</span>
                <Space>
                  <Input.Search
                    placeholder="搜索工作流名称、描述或标签..."
                    style={{ width: 300 }}
                    onSearch={handleSearch}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                  />
                  <Select
                    placeholder="状态筛选"
                    style={{ width: 120 }}
                    value={statusFilter}
                    onChange={setStatusFilter}
                  >
                    <Option value="all">全部状态</Option>
                    <Option value="active">已激活</Option>
                    <Option value="draft">草稿</Option>
                  </Select>
                  {selectedRowKeys.length > 0 && (
                    <Button danger onClick={handleBatchDelete}>
                      批量删除 ({selectedRowKeys.length})
                    </Button>
                  )}
                </Space>
              </div>
            }
            bodyStyle={{ padding: "16px 0 0 0" }} // 给分页留出空间
            style={{
              height: "calc(100vh - 280px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1, overflow: "hidden" }}>
              <Table
                columns={columns}
                dataSource={filteredFlows.slice(
                  (pagination.current - 1) * pagination.pageSize,
                  pagination.current * pagination.pageSize
                )}
                loading={loading}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: filteredFlows.length,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                  pageSizeOptions: ["5", "10", "20", "50"],
                  onShowSizeChange: (current, size) => {
                    setPagination((prev) => ({
                      ...prev,
                      current: 1,
                      pageSize: size,
                    }));
                  },
                  onChange: (page, pageSize) => {
                    setPagination((prev) => ({
                      ...prev,
                      current: page,
                      pageSize,
                    }));
                  },
                  style: {
                    padding: "16px 24px",
                    borderTop: "1px solid #f0f0f0",
                  }, // 分页样式
                }}
                rowSelection={{
                  selectedRowKeys,
                  onChange: handleSelectionChange,
                }}
                onChange={handleTableChange}
                scroll={{ x: 1200, y: "calc(100vh - 500px)" }} // 设置表格滚动高度
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="暂无工作流数据"
                    />
                  ),
                }}
              />
            </div>
          </Card>
        </Content>
      </Layout>

      {/* Create Flow Modal */}
      <Modal
        title={
          <span>
            <PlusOutlined style={{ marginRight: 8 }} />
            新建工作流
          </span>
        }
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateFlow}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label="工作流名称"
            rules={[{ required: true, message: "请输入工作流名称" }]}
          >
            <Input placeholder="请输入工作流名称" />
          </Form.Item>
          <Form.Item name="description" label="工作流描述">
            <TextArea rows={3} placeholder="请输入工作流描述（可选）" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              placeholder="添加标签"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Drawer */}
      <Drawer
        title="工作流详情"
        placement="right"
        width={600}
        open={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
      >
        {selectedFlow && (
          <div>
            <Card title="基本信息" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>名称：</Text>
                  <div>{selectedFlow.name}</div>
                </Col>
                <Col span={12}>
                  <Text strong>版本：</Text>
                  <div>
                    <Tag color="geekblue">{selectedFlow.version}</Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>状态：</Text>
                  <div>
                    <Tag color={getStatusColor(selectedFlow.status)}>
                      {selectedFlow.status === "active" ? "已激活" : "草稿"}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>创建者：</Text>
                  <div>{selectedFlow.creator}</div>
                </Col>
              </Row>
              <Divider />
              <Text strong>描述：</Text>
              <Paragraph>{selectedFlow.description || "暂无描述"}</Paragraph>
              <Text strong>标签：</Text>
              <div style={{ marginTop: 8 }}>
                {selectedFlow.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </Card>

            <Card title="执行统计" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="节点数量" value={selectedFlow.nodeCount} />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="执行次数"
                    value={selectedFlow.executionCount}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="成功率"
                    value={selectedFlow.successRate}
                    suffix="%"
                    valueStyle={{
                      color:
                        selectedFlow.successRate >= 90 ? "#52c41a" : "#faad14",
                    }}
                  />
                </Col>
              </Row>
            </Card>

            <Card title="时间信息">
              <div style={{ marginBottom: 12 }}>
                <Text strong>创建时间：</Text>
                <div>{formatDate(selectedFlow.createdAt)}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>更新时间：</Text>
                <div>{formatDate(selectedFlow.updatedAt)}</div>
              </div>
              <div>
                <Text strong>最后运行：</Text>
                <div>
                  {selectedFlow.lastRunTime
                    ? formatDate(selectedFlow.lastRunTime)
                    : "从未运行"}
                </div>
              </div>
            </Card>
          </div>
        )}
      </Drawer>
    </Layout>
  );
};

export default FlowListPage;
