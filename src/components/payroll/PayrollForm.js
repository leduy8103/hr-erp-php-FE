import React, { useState, useEffect } from 'react';
import employeeService from '../../services/employeeService';
import { createPayroll, updatePayroll } from '../../services/payrollService';

// Vietnamese tax and insurance rates according to regulations
const PERSONAL_INCOME_TAX_RATE = 0.1; // 10% PIT estimate
const SOCIAL_INSURANCE_RATE = 0.08; // 8% Social Insurance
const HEALTH_INSURANCE_RATE = 0.015; // 1.5% Health Insurance
const UNEMPLOYMENT_INSURANCE_RATE = 0.01; // 1% Unemployment Insurance
const DEFAULT_REGION = 'I'; // Region I default (Hanoi, HCM)

// Regional minimum wage (2023)
const REGIONAL_MIN_WAGE = {
    'I': 4680000, // Region I: Hanoi, HCM
    'II': 4160000, // Region II
    'III': 3640000, // Region III
    'IV': 3250000  // Region IV
};

const PayrollForm = ({ onSuccess, onCancel, payrollData }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        employee_id: payrollData?.employee_id || '',
        base_salary: payrollData?.base_salary || '',
        allowances: payrollData?.allowances || '0',
        additional_deductions: payrollData?.deductions || '0',
        pay_period: payrollData?.pay_period || 'Monthly',
        region: payrollData?.region || DEFAULT_REGION
    });
    const [calculations, setCalculations] = useState({
        social_insurance: payrollData?.social_insurance || 0,
        health_insurance: payrollData?.health_insurance || 0,
        unemployment_insurance: payrollData?.unemployment_insurance || 0,
        personal_income_tax: payrollData?.personal_income_tax || 0,
        total_deductions: payrollData?.total_deductions || 0,
        net_salary: payrollData?.net_salary || 0
    });

    // Check if in edit mode
    const isEditMode = !!payrollData;

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        // Calculate tax, insurance, deductions, and net salary
        if (formData.base_salary) {
            const baseSalary = parseFloat(formData.base_salary) || 0;
            const allowances = parseFloat(formData.allowances) || 0;
            const additionalDeductions = parseFloat(formData.additional_deductions) || 0;

            // Salary for social insurance (maximum 20 times regional minimum wage)
            const maxSocialInsuranceSalary = 20 * REGIONAL_MIN_WAGE[formData.region];
            const socialInsuranceSalary = Math.min(baseSalary, maxSocialInsuranceSalary);

            // Calculate insurance amounts
            const socialInsurance = socialInsuranceSalary * SOCIAL_INSURANCE_RATE;
            const healthInsurance = socialInsuranceSalary * HEALTH_INSURANCE_RATE;
            const unemploymentInsurance = socialInsuranceSalary * UNEMPLOYMENT_INSURANCE_RATE;

            // Total insurance
            const totalInsurance = socialInsurance + healthInsurance + unemploymentInsurance;

            // Taxable income = base salary + allowances - insurance - personal reduction
            // Assume personal reduction of 11 million for self
            const personalReduction = 11000000;
            const taxableIncome = Math.max(0, baseSalary + allowances - totalInsurance - personalReduction);

            // Estimate PIT at 10%
            const personalIncomeTax = taxableIncome * PERSONAL_INCOME_TAX_RATE;

            // Total deductions = insurance + PIT + other deductions
            const totalDeductions = totalInsurance + personalIncomeTax + additionalDeductions;

            // Net salary
            const netSalary = baseSalary + allowances - totalDeductions;

            setCalculations({
                social_insurance: socialInsurance,
                health_insurance: healthInsurance,
                unemployment_insurance: unemploymentInsurance,
                personal_income_tax: personalIncomeTax,
                total_deductions: totalDeductions,
                net_salary: netSalary
            });
        }
    }, [formData.base_salary, formData.allowances, formData.additional_deductions, formData.region]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await employeeService.getEmployees();
            if (response && Array.isArray(response)) {
                setEmployees(response);
            } else {
                console.error('Failed to fetch employee list:', response);
                setError('Unable to load employee list');
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching employee list:', err);
            setError('Unable to load employee list. Please try again.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Form validation
        if (!formData.employee_id) {
            setError('Please select an employee');
            return;
        }

        if (!formData.base_salary || parseFloat(formData.base_salary) <= 0) {
            setError('Please enter a valid salary');
            return;
        }

        // Check regional minimum wage
        if (parseFloat(formData.base_salary) < REGIONAL_MIN_WAGE[formData.region]) {
            setError(`Salary cannot be lower than regional minimum wage (${formatCurrency(REGIONAL_MIN_WAGE[formData.region])})`);
            return;
        }

        try {
            setLoading(true);

            // Prepare data
            const payload = {
                employee_id: formData.employee_id,
                base_salary: parseFloat(formData.base_salary),
                allowances: parseFloat(formData.allowances) || 0,
                deductions: parseFloat(formData.additional_deductions) || 0,
                social_insurance: Math.round(calculations.social_insurance),
                health_insurance: Math.round(calculations.health_insurance),
                unemployment_insurance: Math.round(calculations.unemployment_insurance),
                personal_income_tax: Math.round(calculations.personal_income_tax), 
                total_deductions: Math.round(calculations.total_deductions),
                net_salary: Math.round(calculations.net_salary),
                pay_period: formData.pay_period,
                region: formData.region,
                status: payrollData ? payrollData.status : 'Completed'
            };

            console.log(`${isEditMode ? 'Updating' : 'Creating'} payroll data:`, payload);

            let response;
            if (isEditMode) {
                response = await updatePayroll(payrollData.id, payload);
            } else {
                response = await createPayroll(payload);
            }

            if (response.success) {
                onSuccess(response.data);
            } else {
                throw new Error(response.message || 'Operation failed');
            }
        } catch (err) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} payroll:`, err);
            setError(err.message || `An error occurred while ${isEditMode ? 'updating' : 'creating'} payroll`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isEditMode ? 'Update Payroll' : 'Create New Payroll'}
            </h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                    <select
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading || isEditMode} // Disable in edit mode
                        required
                    >
                        <option value="">Select employee</option>
                        {employees.map(employee => (
                            <option key={employee.id} value={employee.id}>
                                {employee.full_name || `ID: ${employee.id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                    <select
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    >
                        <option value="I">Region I - Hanoi, HCM City (4,680,000đ)</option>
                        <option value="II">Region II (4,160,000đ)</option>
                        <option value="III">Region III (3,640,000đ)</option>
                        <option value="IV">Region IV (3,250,000đ)</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary</label>
                    <div className="relative">
                        <input
                            type="number"
                            name="base_salary"
                            value={formData.base_salary}
                            onChange={handleChange}
                            className="w-full p-2 pl-20 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            min={REGIONAL_MIN_WAGE[formData.region]}
                            step="100000"
                            disabled={loading}
                            required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">VND</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Minimum: {formatCurrency(REGIONAL_MIN_WAGE[formData.region])}
                    </p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allowances</label>
                    <div className="relative">
                        <input
                            type="number"
                            name="allowances"
                            value={formData.allowances}
                            onChange={handleChange}
                            className="w-full p-2 pl-20 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            min="0"
                            step="100000"
                            disabled={loading}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">VND</span>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Deductions</label>
                    <div className="relative">
                        <input
                            type="number"
                            name="additional_deductions"
                            value={formData.additional_deductions}
                            onChange={handleChange}
                            className="w-full p-2 pl-20 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                            min="0"
                            step="100000"
                            disabled={loading}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">VND</span>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period</label>
                    <select
                        name="pay_period"
                        value={formData.pay_period}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    >
                        <option value="Monthly">Monthly</option>
                        <option value="Bi-Weekly">Bi-Weekly</option>
                        <option value="Weekly">Weekly</option>
                    </select>
                </div>

                {/* Calculation table */}
                {formData.base_salary && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-md">
                        <h4 className="font-medium text-gray-700 mb-2">Salary Calculation</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-600">Social Insurance ({SOCIAL_INSURANCE_RATE * 100}%):</div>
                            <div className="text-right">{formatCurrency(calculations.social_insurance)}</div>

                            <div className="text-gray-600">Health Insurance ({HEALTH_INSURANCE_RATE * 100}%):</div>
                            <div className="text-right">{formatCurrency(calculations.health_insurance)}</div>

                            <div className="text-gray-600">Unemployment Insurance ({UNEMPLOYMENT_INSURANCE_RATE * 100}%):</div>
                            <div className="text-right">{formatCurrency(calculations.unemployment_insurance)}</div>

                            <div className="text-gray-600">PIT (estimate):</div>
                            <div className="text-right">{formatCurrency(calculations.personal_income_tax)}</div>

                            <div className="text-gray-600">Other Deductions:</div>
                            <div className="text-right">{formatCurrency(parseFloat(formData.additional_deductions || 0))}</div>

                            <div className="text-gray-600 font-medium">Total Deductions:</div>
                            <div className="text-right font-medium">{formatCurrency(calculations.total_deductions)}</div>

                            <div className="border-t border-gray-200 col-span-2 my-1"></div>

                            <div className="text-gray-800 font-medium">Net Salary:</div>
                            <div className="text-right font-medium">{formatCurrency(calculations.net_salary)}</div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                        disabled={loading}
                    >
                        {loading && (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Processing...' : isEditMode ? 'Update' : 'Create Payroll'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PayrollForm;