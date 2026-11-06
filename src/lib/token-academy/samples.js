/**
 * Sample texts for the calculator and the lesson, taken from MSDevBuild Eats,
 * the open-source Flutter food delivery app used across this site
 * (github.com/jssuthahar/food-delivery-app). The code is from
 * lib/features/cart/bloc/cart_bloc.dart.
 */
export const SAMPLES = {
  prompt: {
    label: 'Prompt',
    text: 'In lib/features/cart/bloc/cart_bloc.dart, make _onItemAdded ignore a quantity of 0 or less. Keep the CartConflict flow unchanged. Add a bloc_test case in test/bloc/cart_bloc_test.dart. Show only the diff.',
  },
  code: {
    label: 'Dart code',
    text: `Future<void> _onStarted(CartStarted event, Emitter<CartState> emit) async {
  emit(state.copyWith(status: CartStatus.loading));
  final Result<Cart> result = await _loadCart(const NoParams());
  _emitCart(result, emit);
}

Future<void> _onItemAdded(
  CartItemAdded event,
  Emitter<CartState> emit,
) async {
  // If the basket belongs to another restaurant, surface a conflict instead
  // of silently discarding it - the UI turns this into a confirm dialog.
  if (state.cart.isNotEmpty && !state.cart.belongsTo(event.restaurant.id)) {
    emit(
      state.copyWith(
        pendingConflict: CartConflict(
          existingRestaurantName: state.cart.restaurantName,
          incoming: event,
        ),
      ),
    );
    return;
  }
}`,
  },
  json: {
    label: 'JSON',
    text: `{
  "orderId": "ord_10482",
  "restaurantId": "rest_spice_route",
  "customer": { "id": "cus_2291", "email": "customer@msdevbuild.com" },
  "lines": [
    { "foodItemId": "food_paneer_tikka", "quantity": 2, "unitPrice": 8.5 },
    { "foodItemId": "food_garlic_naan", "quantity": 3, "unitPrice": 2.25 }
  ],
  "promoCode": "WELCOME10",
  "status": "placed"
}`,
  },
  log: {
    label: 'Test log',
    text: `00:02 +12: CartBloc emits loaded cart on CartStarted
00:02 +13: CartBloc raises a conflict when adding from another restaurant
00:03 +13 -1: CartBloc ignores a zero quantity [E]
  Expected: [CartState:<CartState(status: CartStatus.ready, lines: 1)>]
    Actual: [CartState:<CartState(status: CartStatus.mutating, lines: 1)>, CartState:<CartState(status: CartStatus.ready, lines: 2)>]
  package:bloc_test/src/bloc_test.dart 220:16  testBloc.<fn>
  test/bloc/cart_bloc_test.dart 87:7           main.<fn>.<fn>
00:04 +47 -1: Some tests failed.`,
  },
};
