const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class HumaAIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        // Load HR policies and employee data
        this.hrPolicies = this.loadHRPolicies();
        this.employeeData = this.loadEmployeeData();
    }

    loadHRPolicies() {
        try {
            const policyPath = path.join(__dirname, '../../../data/hr_policy.txt');
            return fs.readFileSync(policyPath, 'utf8');
        } catch (error) {
            console.log('HR policy file not found, using default policies');
            return 'HR policies not loaded';
        }
    }

    loadEmployeeData() {
        try {
            const dataPath = path.join(__dirname, '../../../data/employee_data.csv');
            const csvData = fs.readFileSync(dataPath, 'utf8');
            return this.parseCSV(csvData);
        } catch (error) {
            console.log('Employee data file not found');
            return [];
        }
    }

    parseCSV(csvData) {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        const employees = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const employee = {};
                headers.forEach((header, index) => {
                    employee[header.trim()] = values[index]?.trim() || '';
                });
                employees.push(employee);
            }
        }
        return employees;
    }

    async processQuery(userQuery, userId = null) {
        try {
            // Create context for the AI
            const context = this.buildContext(userQuery, userId);
            
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are Huma, a friendly HR assistant for HR-GenAI platform. You help employees with HR-related queries, policies, and general workplace questions.

Context:
${context}

Guidelines:
- Be friendly and professional
- Provide accurate information based on HR policies
- If you need specific employee data, ask for employee ID or name
- For complex queries, suggest contacting HR department
- Keep responses concise but helpful`
                    },
                    {
                        role: "user",
                        content: userQuery
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            return {
                success: true,
                response: response.choices[0].message.content,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Huma AI Error:', error);
            return {
                success: false,
                response: "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact HR directly.",
                error: error.message
            };
        }
    }

    buildContext(query, userId) {
        let context = "HR Policies:\n" + this.hrPolicies.substring(0, 2000) + "\n\n";
        
        // Add employee data context if relevant
        if (query.toLowerCase().includes('leave') || 
            query.toLowerCase().includes('salary') || 
            query.toLowerCase().includes('employee')) {
            context += "Employee Data Available:\n";
            context += "- Employee ID, Name, Position, Department\n";
            context += "- Leave balances, Salary information\n";
            context += "- Employment status and dates\n\n";
        }

        return context;
    }

    // Get employee specific information
    getEmployeeInfo(employeeId) {
        return this.employeeData.find(emp => emp.employee_id === employeeId);
    }

    // Calculate leave balances
    calculateLeaveBalance(employeeId, leaveType) {
        const employee = this.getEmployeeInfo(employeeId);
        if (!employee) return null;

        const currentLeave = parseInt(employee[leaveType] || 0);
        return {
            employee: employee.name,
            leaveType: leaveType,
            balance: currentLeave,
            status: employee.employment_status
        };
    }
}

module.exports = HumaAIService;