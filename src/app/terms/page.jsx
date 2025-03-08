export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
      
      <div className="space-y-8">
       

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Return Eligibility</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Returns must be initiated within 7 days of delivery</li>
            <li>Product must be in original condition with all tags attached</li>
            <li>Original packaging and box must be intact</li>
            <li>All accessories and manuals must be included</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">General Terms</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              By using our service, you agree to these terms and conditions. We reserve the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Modify or terminate our service for any reason, without notice</li>
              <li>Refuse service to anyone for any reason at any time</li>
              <li>Change our terms of service without prior notice</li>
            </ul>
          </div>
        </section>

      
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
          <p className="text-gray-600">
            Questions about the Terms of Service should be sent to our support team through the contact form.
          </p>
        </section>

        <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-amber-900 mb-4">Return Policy & Charges</h2>
          <div className="space-y-4 text-amber-900">
            <p>
              Please note that for all returns, a convenience charge of 40% of the product price will be deducted from your refund amount.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The remaining 60% will be transferred to your UPI</li>
              <li>Processing time for refunds is 5-7 business days after receiving the return</li>
              <li>Deductions are non-negotiable and cover handling, restocking, and processing fees</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}