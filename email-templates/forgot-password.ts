const ForgotPasswordEmailTemplate = (name : string) => `
  <div style="font-family: Arial, sans-serif; font-size: 16px;">
    <h2>Hello, ${name}!</h2>
    <p>Thank you for signing up! We're excited to have you on board.</p>
    <p>Best Regards,<br/>The Sterling's Tech Team</p>
  </div>
`;
export default ForgotPasswordEmailTemplate;