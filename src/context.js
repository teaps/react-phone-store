import React, { Component } from "react";
import { storeProducts, detailProduct } from "./data";
const ProductContext = React.createContext();
//Provider on top of the App --> index.js wrapp the Router / App
//Consumer

class ProductProvider extends Component {
  state = {
    products: [],
    detailProduct,
    cart: [],
    modalOpen: false,
    modalProduct: detailProduct,
    cartSubTotal: 0,
    cartTax: 0,
    cartTotal: 0
  };
  componentDidMount() {
    this.setProducts();
  }
  // Getting the Copies not the Referenz!!
  setProducts = () => {
    let tempProducts = [];
    storeProducts.forEach(item => {
      const singleItem = { ...item };
      tempProducts = [...tempProducts, singleItem];
    });
    this.setState(() => {
      return { products: tempProducts };
    });
  };
  // Liefert das speziefische Product Objekt zurück
  getItem = id => {
    const product = this.state.products.find(item => item.id === id);
    return product;
  };

  handleDetail = id => {
    const product = this.getItem(id);
    this.setState(() => {
      return { detailProduct: product };
    });
  };
  addToCart = id => {
    let tempProducts = [...this.state.products];
    const index = tempProducts.indexOf(this.getItem(id));
    const product = tempProducts[index];
    product.inCart = true;
    product.count = 1;
    const price = product.price;
    product.total = price;

    this.setState(
      () => {
        return { products: tempProducts, cart: [...this.state.cart, product] };
      },
      () => {
        this.addTotals();
      }
    );
  };
  openModal = id => {
    const product = this.getItem(id);
    this.setState(() => {
      return { modalProduct: product, modalOpen: true };
    });
  };
  closeModal = () => {
    this.setState(() => {
      return { modalOpen: false };
    });
  };

  increment = id => {
    // Kreire eine Kopie vom Cart
    let tempCart = [...this.state.cart];
    // Suche das gewählte Produkt mit Hilfe der id im Objekt
    const selectedProuct = tempCart.find(item => item.id === id);
    console.log("selected Product", selectedProuct);

    // suche den zugehörigen Index an dem sich das Objekt im Array befindet
    const index = tempCart.indexOf(selectedProuct);
    //gib das spezifische Objekt zurück
    const product = tempCart[index];
    console.log("Product", product);

    // Incrementiere count +1
    product.count = product.count + 1;
    // Multipliziere  den Produkt preis mit der Anzahl von count
    product.total = product.count * product.price;

    // setze die neuen Informationen in den state zurück
    this.setState(
      () => {
        return { cart: [...tempCart] };
      },
      () => {
        this.addTotals();
      }
    );
  };
  decrement = id => {
    // Kreire eine Kopie vom Cart
    let tempCart = [...this.state.cart];
    // Suche das gewählte Produkt mit Hilfe der id im Objekt
    const selectedProuct = tempCart.find(item => item.id === id);

    // suche den zugehörigen Index an dem sich das Objekt im Array befindet
    const index = tempCart.indexOf(selectedProuct);
    //gib das spezifische Objekt zurück
    const product = tempCart[index];

    // Anzahl der Items um 1 verkleinern und
    product.count = product.count - 1;
    // Wenn kein item mehr im cart vorhanden ist dann remove the item sonst berechne den wert und gibt im den state zurück
    if (product.count === 0) {
      this.removeItem(id);
    } else {
      product.total = product.count * product.price;
      this.setState(
        () => {
          return {
            cart: [...tempCart]
          };
        },
        () => {
          this.addTotals();
        }
      );
    }
  };
  removeItem = id => {
    let tempProducts = [...this.state.products];
    let tempCart = [...this.state.cart];

    // Gibt alle cart items zurück ausser den mit der übergebenen id
    tempCart = tempCart.filter(item => item.id !== id);

    // Suche nach dem Product was gelöscht werden soll und setze die Werte zurück
    const index = tempProducts.indexOf(this.getItem(id));
    // Refefenz zum eigentlichen Objekt in tempProducts somit wird das Objekt in tempProducts verändert
    let removeProduct = tempProducts[index];
    removeProduct.inCart = false;
    removeProduct.count = 0;
    removeProduct.total = 0;
    // Setze den State mit dem aktuallisierten cart und product
    this.setState(
      () => {
        return {
          cart: [...tempCart],
          products: [...tempProducts]
        };
      },
      () => {
        this.addTotals();
      }
    );
  };
  clearCart = () => {
    this.setState(
      () => {
        return { cart: [] };
      },
      () => {
        this.setProducts();
        this.addTotals();
      }
    );
  };
  addTotals = () => {
    let subTotal = 0;
    this.state.cart.map(item => (subTotal += item.total));
    const tempTax = subTotal * 0.1;
    const tax = parseFloat(tempTax.toFixed(2));
    const total = subTotal + tax;
    this.setState(() => {
      return {
        cartSubTotal: subTotal,
        cartTax: tax,
        cartTotal: total
      };
    });
  };
  render() {
    return (
      <ProductContext.Provider
        value={{
          ...this.state,
          handleDetail: this.handleDetail,
          addToCart: this.addToCart,
          openModal: this.openModal,
          closeModal: this.closeModal,
          increment: this.increment,
          decrement: this.decrement,
          removeItem: this.removeItem,
          clearCart: this.clearCart
        }}
      >
        {this.props.children}
      </ProductContext.Provider>
    );
  }
}

const ProductConsumer = ProductContext.Consumer;

export { ProductProvider, ProductConsumer };
