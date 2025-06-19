import React from "react";
import {
  Document,
  Page,
  View,
  Image,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import { OrderStatusType } from "@/components/orders/status/order-status";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 10,
  },
  table: {
    display: "flex",
    justifyContent: "space-around",
    margin: 10,
    borderLeft: "1px solid black",
    borderRight: "1px solid black",
    top: 0,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    borderBottomWidth: 1,
    borderColor: "#000000",
  },
  tableHeader: {
    fontWeight: "bold",
    fontSize: 8,
  },
  tableCell: {
    paddingRight: 5,
    paddingLeft: 5,
    textAlign: "right",
    fontSize: 7,
    margin: 1,
  },
  container: {
    display: "flex",
    paddingBottom: 250,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  image: {
    width: 225,
    top: 20,
    height: 100,
  },
  textColum1: {
    fontFamily: "Helvetica",
    fontSize: 7,
    color: "#red",
    margin: 10,
    textAlign: "left",
  },
  textColum2: {
    fontFamily: "Helvetica",
    fontSize: 7,
    color: "#89ca8f",
    margin: 10,
    textAlign: "left",
  },
  textColum3: {
    fontFamily: "Helvetica",
    fontSize: 7,
    color: "#89ca8f",
    margin: 10,
    textAlign: "right",
  },
  
  textBlack: {
    color: "black",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 10,
    marginRight: 10,
  },
  columnFlex2: {
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 25,
  },
  spaceAround: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 10,
  },
  endJustify: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  infoBlock: {
    marginTop: 20,
    paddingTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginRight: 10,
    height: 100,
    width: 350,
  },
  infoText: {
    fontSize: 8,
    marginBottom: 5,
  },
});

interface OrderPDFProps {
  order?: {
    id?: string
    numberOrder?: string
    date?: any
    total?: number
    orderItems?: {
      id?: string
      name?: string
      unit_price?: number
      quantity?: number
      subtotal?: number
      color?: string
      talle?: string
      image?: string | string[]
      productId?: string
      descuento?: number
    }[]
    infoEntrega?: {
      name?: string
      apellido?: string
      telefono?: string
      email?: string
      calle?: string
      numero?: string
      ciudad?: string
      estado?: string
      codigoPostal?: string
      pisoDpto?: string
    }
    status?: OrderStatusType
    tipoEnvio?: number
    envioSeleccionado?: string
  }
}

export const OrderPDF: React.FC<OrderPDFProps> = ({ order = {} }) => {
  const {
    numberOrder = 'Sin número',
    date = new Date(),
    orderItems = [],
    infoEntrega = {},
    tipoEnvio = 0,
    envioSeleccionado = ''
  } = order;

  const {
    name = 'Sin nombre',
    apellido = '',
    telefono = '',
    email = '',
    calle = '',
    numero = '',
    ciudad = '',
    estado = '',
    codigoPostal = '',
    pisoDpto = ''
  } = infoEntrega;

  const totalPrice = orderItems.reduce((acc, item) => acc + (item.subtotal || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{
            paddingBottom: 250,
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            marginLeft: 32,
            padding: 32,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              justifyContent: "space-around",
            }}
          >
            <View style={styles.infoBlock}>
              <Text style={styles.infoText}>
                Dirección: Rivadavia 5931, de 09:00 a 17:00hs, Mar del Plata.
              </Text>
              <Text style={styles.infoText}>Teléfono: +54 223 348-5438</Text>
              <Text style={styles.infoText}>
                Email: kaury.store@gmail.com
              </Text>
              <Text style={styles.infoText}>www.mayoristakaurymdp.com</Text>
            </View>

            <View style={{ position: 'relative', marginBottom: 20 }}>
              <Image
                src="/ready.png"
                style={styles.image}
              />
            </View>
          </View>
          <View style={styles.header}>
            <Text
              style={{
                marginLeft: 250,
                fontSize: 10,
                marginTop: 5,
                textAlign: "right",
              }}
            >
              Fecha Orden:{" "}
              {date?.seconds
                ? new Date(date.seconds * 1000).toLocaleString()
                : new Date().toLocaleString()}
            </Text>
            <View style={styles.columnFlex2}>
              <Text>Pedido ID: #{numberOrder}</Text>
              <Text style={{ marginBottom: 10, marginTop: 32 }}>
                Cliente: {name} {apellido}
              </Text>
              <Text style={styles.infoText}>
                Teléfono: {telefono || 'No especificado'}
              </Text>
              <Text style={styles.infoText}>Email: {email || 'No especificado'}</Text>
              <Text style={styles.infoText}>
                {[calle, numero, ciudad, estado].filter(Boolean).join(', ') || 'Dirección no especificada'}
                {codigoPostal ? ` CP: ${codigoPostal}` : ''} 
                {pisoDpto ? ` ${pisoDpto}` : ''}
              </Text>
              <Text style={styles.infoText}>
                {tipoEnvio === 1 ? "Envio Adreani" : "Retiro por sucursal kaury"}
              </Text>
              {tipoEnvio === 1 && (
                <Text style={styles.infoText}>
                  {envioSeleccionado === "envioSucursal"
                    ? "Entrega a sucursal a coordinar"
                    : "Envio a domicilio"}
                </Text>
              )}
              {tipoEnvio === 2 && (
                <Text style={styles.infoText}>
                  Rivadavia 5931 / 10:00 a 17:00hs
                </Text>
              )}
            </View>
          </View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text
                style={{
                  ...styles.tableHeader,
                  width: 300,
                  marginLeft: 5,
                }}
              >
                Producto
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  ...styles.tableHeader,
                  width: 25,
                }}
              >
                U.
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  ...styles.tableHeader,
                  width: 50,
                }}
              >
                Precio U.
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  ...styles.tableHeader,
                  width: 30,
                }}
              >
                Dto %
              </Text>
              <Text
                style={{
                  ...styles.tableCell,
                  ...styles.tableHeader,
                  width: 125,
                  textAlign: "right",
                  marginRight: 10,
                }}
              >
                Totales
              </Text>
            </View>
            {(orderItems || []).map((producto = {}, index) => {
              const uniqueKey = `item-${index}`;
              const { name = 'Sin nombre', talle = '-', color = '-', quantity = 0, unit_price = 0, descuento = 0, subtotal = 0 } = producto;
              
              return (
                <View key={uniqueKey} style={styles.tableRow}>
                  <View style={{ ...styles.tableCell, width: 300 }}>
                    <Text
                      style={{
                        color: "black",
                        textAlign: "left",
                        fontSize: 7.5,
                      }}
                    >
                      {`Articulo: ${name} / Talle: ${talle} / Color: ${color}`}
                    </Text>
                  </View>
                  <View style={{ ...styles.tableCell, width: 25 }}>
                    <Text
                      style={{
                        color: "black",
                        textAlign: "right",
                        fontSize: 7.5,
                      }}
                    >
                      {quantity}
                    </Text>
                  </View>
                  <View style={{ ...styles.tableCell, width: 50 }}>
                    <Text
                      style={{
                        color: "black",
                        textAlign: "right",
                        fontSize: 7,
                      }}
                    >
                      {unit_price.toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                  <View style={{ ...styles.tableCell, width: 30 }}>
                    <Text
                      style={{
                        color: "black",
                        textAlign: "right",
                        fontSize: 7,
                      }}
                    >
                      {descuento}
                    </Text>
                  </View>
                  <View
                    style={{
                      ...styles.tableCell,
                      width: 125,
                      marginLeft: 10,
                    }}
                  >
                    <Text style={styles.tableCell}>
                      {subtotal.toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: 550,
              margin: 10,
              borderBottom: "1px solid black",
            }}
          >
            <View>
              <Text style={{ fontSize: 10 }}>Total Orden: </Text>
            </View>
            <View>
              <Text style={{ fontSize: 10, fontWeight: 900 }}>
                {totalPrice.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};