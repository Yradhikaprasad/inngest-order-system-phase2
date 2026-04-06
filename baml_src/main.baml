generator target {
  output_type "typescript"
  output_dir "../src"
  version "0.58.0"
}

enum OrderDecision {
  Approve
  Review
  Reject
}

class Classification {
  decision OrderDecision
  reason string
  confidence float
}

function ClassifyOrder(input: string) -> Classification {
  client "openai/gpt-4o-mini"
  prompt #"
    Analyze this inventory data for Order:
    {{input}}

    Decide if we should Approve, Review, or Reject.
    Return JSON.
  "#
}