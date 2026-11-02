from openai import OpenAI

client = OpenAI(
    base_url="https://inference.baseten.co/v1",
    api_key="b10_peowtVNx.uT0MpY4TWfwFKGi4oFK3QwojdX3nbI2j"
)

response = client.chat.completions.create(
    model="meta-models/muse-spark-open-1026",
    messages=[{"role": "user", "content": "Say hello, my GasSafe credit works!"}]
)

print(response.choices[0].message.content)