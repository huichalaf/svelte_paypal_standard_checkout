<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PayPal JS SDK Demo</title>
  <script
    data-sdk-integration-source="integrationbuilder_sc"
    src="https://www.paypal.com/sdk/js?client-id=&components=buttons&enable-funding=venmo,paylater&vault=true"></script>
</svelte:head>

<script>
    import { onMount } from 'svelte';
    onMount(async () => {
    const FUNDING_SOURCES = [
        paypal.FUNDING.PAYPAL,
        paypal.FUNDING.CARD
    ];
    FUNDING_SOURCES.forEach(fundingSource => {
      paypal.Buttons({
        fundingSource,
        style: {
          layout: 'horizontal',
          shape: 'pill',
          color: (fundingSource == paypal.FUNDING.PAYLATER) ? 'gold' : '',
        },
        createSubscription: (data, actions) => {
            return actions.subscription.create({
                plan_id: "P-3RX065706M3469222L5IFM4I",
            });
        },
        onApprove: async (data, actions) => {
          try {
            console.log(data.orderID);
            const response = await fetch(`/orders_execute?orderID=${data.orderID}`, {
                method: "POST",
                body : JSON.stringify({"orderID": data.orderID}),
                headers: {
                    "Content-Type": "application/json"
                },
            });
            const details = await response.json();
            const errorDetail = Array.isArray(details.details) && details.details[0];
            if (errorDetail && errorDetail.issue === 'INSTRUMENT_DECLINED') {
              return actions.restart();
            }
            if (errorDetail) {
              let msg = 'Sorry, your transaction could not be processed.';
              msg += errorDetail.description ? ' ' + errorDetail.description : '';
              msg += details.debug_id ? ' (' + details.debug_id + ')' : '';
              alert(msg);
            }
            console.log('Capture result', details, JSON.stringify(details, null, 2));
            const transaction = details.purchase_units[0].payments.captures[0];
            alert('Transaction ' + transaction.status + ': ' + transaction.id + 'See console for all available details');
          } catch (error) {
            console.error(error);
          }
        },
      }).render("#paypal-button-container");
    })
    });
  </script>
<div class="py-4">
    <div id="paypal-button-container"></div>
</div>