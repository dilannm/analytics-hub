$(function () {

// Create a Stripe client
var stripe = Stripe('pk_test_6pRNASCoBOKtIshFeQd4XMUh');

// Create an instance of Elements
var elements = stripe.elements();

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
var style = {
  base: {
    color: '#32325d',
    lineHeight: '24px',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4'
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

// Create an instance of the card Element
var card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

// Handle form submission
var form = document.getElementById('payment-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();

  stripe.createToken(card).then(function(result) {
    if (result.error) {
      // Inform the user if there was an error
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
    } else {
      // Send the token to your server
		getGadgetLocation(function(gadget_Location) {
        gadgetLocation = gadget_Location;
				 $.ajax({
					url: gadgetLocation + '/gadget-controller.jag?action=setToken',
					method: METHOD.POST,
				   data: JSON.stringify( { "token": result.token.id } ),
					contentType: CONTENT_TYPE,
					async: false,
					success: function (data) {

					},
					complete : function (xhr, textStatus) {
						if (xhr.status == "403") {
							window.top.location.reload(false);
						}
					}
				});
			});
			alert("Valid card");
		
		document.getElementById('payDiv').hidden = false;
     // stripeTokenHandler(result.token[1]);
    }
  });
});
	
	
    $("#pay").click(function () {
		var txt;
		var reply = confirm("You are going to pay :"+ $('#amount').val()+"$. Please conform!");
		if (reply == true) {
			$.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=pay',
            method: METHOD.POST,
           data: JSON.stringify( { "token": $('#token').val(), "amount": $('#amount').val() } ),
            contentType: CONTENT_TYPE,
            async: false,
            success: function (data) {
             
            },
            complete : function (xhr, textStatus) {
                if (xhr.status == "403") {
                    window.top.location.reload(false);
                }
            }
        });
			
		} else {
			
		}
    
  
		 
    });



});
