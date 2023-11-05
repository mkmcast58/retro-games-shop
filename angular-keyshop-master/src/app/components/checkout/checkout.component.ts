import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { KeyshopFormService } from 'src/app/services/keyshop-form.service';
import { KeyshopValidators } from 'src/app/validators/keyshop-validators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;

  //stripe initializzaztion
  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  dipslayError: any = '';

  isDisabled: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private keyshopFormService: KeyshopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reviewCartDetails();

    //setup Stripe peyment form
    this.setupStripePaymentForm();

    //read user mail address from, browser storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          KeyshopValidators.notOnlyWhitespace,
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          KeyshopValidators.notOnlyWhitespace,
        ]),
        email: new FormControl(theEmail, [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          KeyshopValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          KeyshopValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          KeyshopValidators.notOnlyWhitespace,
        ]),
      }),
      billingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          KeyshopValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          KeyshopValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          KeyshopValidators.notOnlyWhitespace,
        ]),
      }),
      creditCard: this.formBuilder.group({
        /*
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          KeyshopValidators.notOnlyWhitespace,
        ]),
        cardNumber: new FormControl('', [
          Validators.required,
          Validators.pattern('[[0-9]{16}'),
        ]),
        securityCode: new FormControl('', [
          Validators.required,
          Validators.pattern('[[0-9]{3}'),
        ]),
        expirationMonth: [''],
        expirationYear: [''],
      */
      }),
    });

    //do listy miesciecy

    // const startMonth: number = new Date().getMonth() + 1;
    // console.log(`start month = ${startMonth}`);

    // this.keyshopFormService
    //   .getCreditcardMonths(startMonth)
    //   .subscribe((data) => {
    //     console.log('miesiace kary kredytowej: ' + JSON.stringify(data));
    //     this.creditCardMonths = data;
    //   });
    // //do listy rokow

    // const startYear: number = new Date().getFullYear();
    // console.log(`start year = ${startYear}`);

    // this.keyshopFormService.getCreditCardYears().subscribe((data) => {
    //   console.log('miesiace kary kredytowej: ' + JSON.stringify(data));
    //   this.creditCardYears = data;
    // });

    //populate countries
    this.keyshopFormService.getCountries().subscribe((data) => {
      this.countries = data;
    });
  }

  setupStripePaymentForm() {
    var elements = this.stripe.elements();
    this.cardElement = elements.create('card', { hidePostalCode: true });
    this.cardElement.mount('#card-element');
    this.cardElement.on('change', (event) => {
      this.dipslayError = document.getElementById('card-errors');

      if (event.complete) {
        this.dipslayError.textContent = "";
      } else if (event.error) {
        this.dipslayError.textContent = event.error.message;
      }
    });
  }

  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      (totalQuantity) => (this.totalQuantity = totalQuantity)
    );
    this.cartService.totalPrice.subscribe(
      (totalPrice) => (this.totalPrice = totalPrice)
    );
  }

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }
  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }
  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }
  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }
  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }
  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state');
  }
  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }
  get shippingAddressZipCode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode');
  }
  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country');
  }
  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street');
  }
  get billingAddressState() {
    return this.checkoutFormGroup.get('billingAddress.state');
  }
  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city');
  }
  get billingAddressZipCode() {
    return this.checkoutFormGroup.get('billingAddress.zipCode');
  }
  get creditCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType');
  }
  get creditCardNameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard');
  }
  get creditCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber');
  }
  get creditCardSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode');
  }

  copyShippingAddressToBillingAddress(event) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls.billingAddress.setValue(
        this.checkoutFormGroup.controls.shippingAddress.value
      );
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls.billingAddress.reset();
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(
      creditCardFormGroup.value.expirationYear
    );

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.keyshopFormService
      .getCreditcardMonths(startMonth)
      .subscribe((data) => {
        console.log('Retrieved credit card months ' + JSON.stringify(data));
        this.creditCardMonths = data;
      });
  }

  onSubmit() {
    // console.log('Handling submit button');

    
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    //set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    //get cart items
    const cartItems = this.cartService.cartItems;

    // create oorrder Items form cart items
    let orderItems: OrderItem[] = cartItems.map(
      (tempCartItem) => new OrderItem(tempCartItem)
    );

    //set up purchase
    let purchase = new Purchase();

    //populate purchase with customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    //populate purchase with shipadress
    purchase.shippingAddress =
      this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(
      JSON.stringify(purchase.shippingAddress.state)
    );
    const shippingCoutry: Country = JSON.parse(
      JSON.stringify(purchase.shippingAddress.country)
    );
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingState.name;

    //populate purchase with billiadress
    purchase.billingAddress =
      this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(
      JSON.stringify(purchase.billingAddress.state)
    );
    const billingCoutry: Country = JSON.parse(
      JSON.stringify(purchase.billingAddress.country)
    );
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCoutry.name;

    //populate purchase with order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    //compute payment info for stripe
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;

    console.log(`this.paymentinfo.amount: ${this.paymentInfo.amount}`);

    if(!this.checkoutFormGroup.invalid && this.dipslayError.textContent === ""){

      this.isDisabled = true;

      this.checkoutService
      .createPaymentIntent(this.paymentInfo)
      .subscribe((paymentIntentResponse) => {
        this.stripe
          .confirmCardPayment(
            paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,

                billing_details:{
                  email: purchase.customer.email,
                  name: `${purchase.customer.firstname} ${purchase.customer.lastName}`,
                  address:{
                    line1: purchase.billingAddress.street,
                    city: purchase.billingAddress.city,
                    state: purchase.billingAddress.state,
                    postal_code: purchase.billingAddress.zipCode,
                    country: this.billingAddressCountry.value.code
                  }
                }
              },
            },
            { handleAction: false }
          )
          .then((result: any) => {
            if (result.error) {
              alert(`There was an error: ${result.error.message}`);
              this.isDisabled = false;
            } else {
              this.checkoutService.placeOrder(purchase).subscribe({
                next: (response: any) => {
                  alert(
                    `Your order has been received\nOrder tracking number: ${response.orderTrackingNumber}`
                  );
                  this.resetCart();
                  this.isDisabled = false;
                },
                error: (err: any) => {
                  alert(`There was an error: ${result.error.message}`);
                  this.isDisabled = false;
                },
              });
            }
          });
      });
    }else{
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    

    //call REST API via CheckoutService

    // this.checkoutService.placeOrder(purchase).subscribe({
    //   next: (response) => {
    //     alert(
    //       `Your order has been receiverd.\nOrder tracking number: ${response.orderTrackingNumber}`
    //     );
    //     this.resetCart();
    //   },
    //   error: (err) => {
    //     alert(`There was an error ${err.message}`);
    //   },
    // });

    // console.log(this.checkoutFormGroup.get('customer').value);
    // console.log(
    //   'The shipping addres country is ' +
    //     this.checkoutFormGroup.get('shippingAddress').value.country.name
    // );
    // console.log(
    //   'The shipping addres state is ' +
    //     this.checkoutFormGroup.get('shippingAddress').value.state.name
    // );
  }
  resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    //updates storage with latest state of the cart
    this.cartService.persistCartItems();

    this.checkoutFormGroup.reset();

    this.router.navigateByUrl('/products');
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.keyshopFormService.getStates(countryCode).subscribe((data) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressStates = data;
      } else {
        this.billingAddressStates = data;
      }
      //selecting 1st state as default
      formGroup.get('state').setValue(data[0]);
    });
  }
}
