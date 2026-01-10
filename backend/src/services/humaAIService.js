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
            if (fs.existsSync(policyPath)) {
                return fs.readFileSync(policyPath, 'utf8');
            } else {
                console.log('HR policy file not found, using default policies');
                return `HR POLICY MANUAL - LEAVE POLICY

Vacation Leave: 15 days per year for full-time employees
Sick Leave: 15 days per year for full-time employees
Service Incentive Leave: 5 days per year after 1 year of service

Leave Application: Submit through Employee Self Service portal
Approval: Required from immediate supervisor
Carryover: Vacation and Sick leave can be carried over (max 30 days)
Encashment: Vacation leave can be encashed, Sick leave cannot`;
            }
        } catch (error) {
            console.log('Error loading HR policies:', error.message);
            return 'HR policies not available';
        }
    }

    loadEmployeeData() {
        try {
            const dataPath = path.join(__dirname, '../../../data/employee_data.csv');
            if (fs.existsSync(dataPath)) {
                const csvData = fs.readFileSync(dataPath, 'utf8');
                return this.parseCSV(csvData);
            } else {
                console.log('Employee data file not found, using sample data');
                return [
                    {
                        employee_id: '1005676',
                        name: 'Alexander Verdad',
                        position: 'Account Receivable Assistant',
                        vacation_leave: '45',
                        sick_leave: '8',
                        employment_status: 'Permanent'
                    }
                ];
            }
        } catch (error) {
            console.log('Error loading employee data:', error.message);
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
            // Check if OpenAI API key is available
            if (!process.env.OPENAI_API_KEY) {
                return this.getFallbackResponse(userQuery);
            }

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
- Keep responses concise but helpful
- If asked about leave balances, mention the available leave types: Vacation Leave (15 days/year), Sick Leave (15 days/year), Service Incentive Leave (5 days/year)`
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
            
            // Return fallback response for any error
            return this.getFallbackResponse(userQuery);
        }
    }

    // Fallback response when OpenAI is not available
    getFallbackResponse(userQuery) {
        const query = userQuery.toLowerCase();
        
        if (query.includes('leave') || query.includes('vacation') || query.includes('sick')) {
            return {
                success: true,
                response: "📋 **HR Leave Policies:**\n\n• **Vacation Leave:** 15 days per year for full-time employees\n• **Sick Leave:** 15 days per year for full-time employees\n• **Service Incentive Leave:** 5 days per year after 1 year of service\n\n**Application Process:**\n- Submit through Employee Self Service portal\n- Get approval from immediate supervisor\n- Vacation and Sick leave can be carried over (max 30 days)\n- Vacation leave can be encashed, Sick leave cannot\n\nFor specific leave balances, please contact HR directly.",
                timestamp: new Date().toISOString()
            };
        }
        
        if (query.includes('policy') || query.includes('policies')) {
            return {
                success: true,
                response: "📚 **HR Policies Available:**\n\n• Leave Policy (Vacation, Sick, Service Incentive)\n• Attendance Policy\n• Employee Benefits\n• Code of Conduct\n• Performance Management\n\n**Key Points:**\n- All policies are available in Employee Self Service portal\n- Regular updates are communicated via email\n- For specific policy questions, contact HR department\n\nWhat specific policy would you like to know about?",
                timestamp: new Date().toISOString()
            };
        }
        
        if (query.includes('contact') || query.includes('hr')) {
            return {
                success: true,
                response: "📞 **Contact HR Department:**\n\n• Email: hr@company.com\n• Phone: Available during business hours\n• Employee Self Service Portal: For leave applications and policy access\n• Office Hours: Monday to Friday, 9 AM - 5 PM\n\n**For Immediate Assistance:**\n- Leave applications and approvals\n- Policy clarifications\n- Employee benefits information\n- General HR inquiries",
                timestamp: new Date().toISOString()
            };
        }
        
        return {
            success: true,
            response: "👋 Hi! I'm Huma, your HR assistant. I can help you with:\n\n• **HR Policies** - Leave, attendance, benefits\n• **Leave Balances** - Vacation, sick, service incentive leave\n• **General Questions** - HR procedures and guidelines\n\n**Popular Topics:**\n- \"leave policies\" - Get information about vacation and sick leave\n- \"contact hr\" - Get HR department contact information\n- \"policies\" - Browse available HR policies\n\nWhat would you like to know about?",
            timestamp: new Date().toISOString()
        };
    }

    buildContext(query, userId) {
        let context = "HR Policies:\n" + this.hrPolicies.substring(0, 1500) + "\n\n";
        
        // Add employee data context if relevant
        if (query.toLowerCase().includes('leave') || 
            query.toLowerCase().includes('salary') || 
            query.toLowerCase().includes('employee') ||
            query.toLowerCase().includes('vacation') ||
            query.toLowerCase().includes('sick') ||
            query.toLowerCase().includes('policy')) {
            context += "Employee Data Available:\n";
            context += "- Employee ID, Name, Position, Department\n";
            context += "- Leave balances, Salary information\n";
            context += "- Employment status and dates\n\n";
            
            // Add sample employee data
            if (this.employeeData.length > 0) {
                context += "Sample Employee Data:\n";
                context += `Name: ${this.employeeData[0].name || 'N/A'}\n`;
                context += `Position: ${this.employeeData[0].position || 'N/A'}\n`;
                context += `Vacation Leave: ${this.employeeData[0].vacation_leave || 'N/A'}\n`;
                context += `Sick Leave: ${this.employeeData[0].sick_leave || 'N/A'}\n\n`;
            }
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