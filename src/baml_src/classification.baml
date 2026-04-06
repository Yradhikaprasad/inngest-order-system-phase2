enum OrderStatus {
  Approve
  Review
  Reject
}

class Classification {
  decision OrderStatus
  reason string
  confidence float
}

function ClassifyOrder(orderData: string) -> Classification {
  client "openai/gpt-4o"
  prompt #"
    Analyze the following order inventory data.
    Determine if we should ship it, review it, or reject it.
    
    Data: {{orderData}}

    Output JSON.
  "#
}