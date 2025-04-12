import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFViewer,
  Font,
  PDFDownloadLink
} from '@react-pdf/renderer';

// Đăng ký font hỗ trợ tiếng Việt nếu cần
Font.register({
    family: 'Open Sans',
    fonts: [
      { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
      { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 'semibold' },
      { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 'bold' }
    ]
  });

// Định nghĩa stylesheet
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Open Sans' 
      },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold'
  },
  section: {
    marginBottom: 10,
  },
  header: {
    fontSize: 14,
    marginVertical: 10,
    fontWeight: 'bold'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5
  },
  label: {
    flex: 2,
    fontWeight: 'normal',
  },
  value: {
    flex: 3
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    padding: 5,
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf'
  },
  tableAmount: {
    width: '30%',
    textAlign: 'right'
  },
  tableTitleCell: {
    width: '70%',
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#bfbfbf',
  },
  totalLabel: {
    flex: 2,
    fontWeight: 'bold',
  },
  totalValue: {
    flex: 3,
    fontWeight: 'bold'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey'
  }
});

// Helper để format tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

// Component chính cho phiếu lương
const PayrollPDF = ({ payroll }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Tiêu đề */}
      <Text style={styles.title}>PHIẾU LƯƠNG</Text>
      
      {/* Thông tin nhân viên */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Mã nhân viên:</Text>
          <Text style={styles.value}>{payroll.employee_id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tên nhân viên:</Text>
          <Text style={styles.value}>{payroll.employee?.full_name || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{payroll.employee?.email || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Chức vụ:</Text>
          <Text style={styles.value}>{payroll.employee?.position || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Kỳ lương:</Text>
          <Text style={styles.value}>
            {payroll.pay_period === 'Monthly' ? 'Hàng tháng' : 
             payroll.pay_period === 'Bi-Weekly' ? 'Hai tuần' : 
             payroll.pay_period === 'Weekly' ? 'Hàng tuần' : payroll.pay_period}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Ngày tạo:</Text>
          <Text style={styles.value}>{new Date().toLocaleDateString('vi-VN')}</Text>
        </View>
      </View>
      
      {/* Chi tiết lương */}
      <Text style={styles.header}>CHI TIẾT LƯƠNG</Text>
      
      {/* Bảng thu nhập */}
      <Text style={[styles.label, { marginTop: 10 }]}>KHOẢN THU NHẬP:</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.tableTitleCell]}>Mô tả</Text>
          <Text style={[styles.tableCell, styles.tableAmount]}>Số tiền (VND)</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableTitleCell]}>Lương cơ bản</Text>
          <Text style={[styles.tableCell, styles.tableAmount]}>{formatCurrency(payroll.base_salary)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableTitleCell]}>Phụ cấp</Text>
          <Text style={[styles.tableCell, styles.tableAmount]}>{formatCurrency(payroll.allowances || 0)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableTitleCell, {fontWeight: 'bold'}]}>Tổng thu nhập</Text>
          <Text style={[styles.tableCell, styles.tableAmount, {fontWeight: 'bold'}]}>
            {formatCurrency((payroll.base_salary || 0) + (payroll.allowances || 0))}
          </Text>
        </View>
      </View>
      
      {/* Bảng khấu trừ */}
      <Text style={[styles.label, { marginTop: 10 }]}>KHOẢN KHẤU TRỪ:</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.tableTitleCell]}>Mô tả</Text>
          <Text style={[styles.tableCell, styles.tableAmount]}>Số tiền (VND)</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableTitleCell]}>BHXH (8%)</Text>
          <Text style={[styles.tableCell, styles.tableAmount]}>{formatCurrency(payroll.social_insurance || 0)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableTitleCell]}>BHYT (1.5%)</Text>
          <Text style={[styles.tableCell, styles.tableAmount]}>{formatCurrency(payroll.health_insurance || 0)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableTitleCell]}>BHTN (1%)</Text>
          <Text style={[styles.tableCell, styles.tableAmount]}>{formatCurrency(payroll.unemployment_insurance || 0)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableTitleCell]}>Thuế TNCN</Text>
          <Text style={[styles.tableCell, styles.tableAmount]}>{formatCurrency(payroll.personal_income_tax || 0)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableTitleCell]}>Khấu trừ khác</Text>
          <Text style={[styles.tableCell, styles.tableAmount]}>{formatCurrency(payroll.deductions || 0)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableTitleCell, {fontWeight: 'bold'}]}>Tổng khấu trừ</Text>
          <Text style={[styles.tableCell, styles.tableAmount, {fontWeight: 'bold'}]}>
            {formatCurrency(payroll.total_deductions || 0)}
          </Text>
        </View>
      </View>
      
      {/* Lương thực nhận */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>LƯƠNG THỰC NHẬN:</Text>
        <Text style={styles.totalValue}>{formatCurrency(payroll.net_salary || 0)} VND</Text>
      </View>
      
      {/* Footer */}
      <Text style={styles.footer}>
        Ghi chú: Phiếu lương này đã được tạo tự động từ hệ thống
      </Text>
    </Page>
  </Document>
);

// Component để xem trước PDF
export const PayrollPDFViewer = ({ payroll }) => (
  <PDFViewer style={{ width: '100%', height: '600px' }}>
    <PayrollPDF payroll={payroll} />
  </PDFViewer>
);

// Component tạo link tải xuống
export const PayrollPDFDownloadButton = ({ payroll }) => (
  <PDFDownloadLink
    document={<PayrollPDF payroll={payroll} />}
    fileName={`phieu-luong-${payroll.employee_id}-${new Date().toISOString().split('T')[0]}.pdf`}
    style={{
      padding: '10px 16px',
      backgroundColor: '#4F46E5',
      color: 'white',
      borderRadius: '0.375rem',
      textDecoration: 'none',
      display: 'inline-block',
      fontWeight: 'medium',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    }}
  >
    {({ blob, url, loading, error }) =>
      loading ? 'Đang tạo phiếu lương...' : 'Tải phiếu lương'
    }
  </PDFDownloadLink>
);

export default PayrollPDF;