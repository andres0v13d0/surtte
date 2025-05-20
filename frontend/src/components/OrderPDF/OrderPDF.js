import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    padding: 20,
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBox: {
    width: 350,
    border: '2px solid #ccc',
    borderRadius: 10,
    padding: 10,
    alignItems: 'left',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  orderBox: {
    width: 200,
    border: '2px solid #ccc',
    borderRadius: 10,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 10,
    fontSize: '10px',
  },
  table: {
    border: '2px solid #ccc',
    borderCollapse: 'collapse',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '2px solid #ccc',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  cell: {
    padding: 5,
  },
  imgCell: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refCell: { width: 100 },
  nameCell: { width: 200 },
  qtyCell: { width: 100, textAlign: 'center' },
  unitCell: { width: 150, textAlign: 'center' },
  totalCell: { width: 150, textAlign: 'center' },
  totalRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  totalLabel: {
    width: 470,
    padding: 5,
  },
  totalText: {
    width: 145,
    border: '2px solid #ccc',
    padding: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  totalValue: {
    width: 150,
    border: '2px solid #ccc',
    borderLeft: 'none',
    padding: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

const OrderPDF = ({ content }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.infoBox}>
          <Image style={styles.logo} src={content.logo}/>
          <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Diverso Sport</Text>
          <Text style={{marginTop: '5px', fontSize: '10px'}}><Text style={{fontWeight: 'bold'}}>Nombre del cliente: </Text> {content.nombre_cliente || 'No hay nombre'}</Text>
          <Text style={{ fontSize: '10px'}}><Text style={{fontWeight: 'bold'}}>Número de celular:</Text> +57 {content.celular || 'Sin celular'}</Text>
          <Text style={{fontWeight: 'bold', fontSize: '10px'}}>Dirección:</Text>
          <Text style={{ fontSize: '10px' }}>{content.direccion || 'No registra dirección'}</Text>
          <Text style={{fontWeight: 'bold', fontSize: '10px'}}>Notas:</Text>
          <Text style={{ fontSize: '10px' }}>{content.notas || 'No registra notas'}</Text>
        </View>

        <View style={styles.orderBox}>
          <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>Pedido # {content.orden_num || '1001'}</Text>
          <Text>Fecha: {content.fecha || '01/01/2025'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.table, styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, styles.imgCell]}></Text>
          <Text style={[styles.cell, styles.refCell]}>Ref.</Text>
          <Text style={[styles.cell, styles.nameCell]}>Producto</Text>
          <Text style={[styles.cell, styles.qtyCell]}>Cantidad</Text>
          <Text style={[styles.cell, styles.unitCell]}>Valor unitario</Text>
          <Text style={[styles.cell, styles.totalCell]}>Valor total</Text>
        </View>
        {content.items?.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.cell, styles.imgCell]}>
              <Image src={item.imagen || ''} style={{ width: 40, height: 40 }} />
            </View>
            <Text style={[styles.cell, styles.refCell]}>{item.referencia || ''}</Text>
            <View style={[styles.cell, styles.nameCell]}>
              <Text>{item.nombre_producto || ''}</Text>
              {item.talla && <Text>Talla: {item.talla}</Text>}
              {item.color && <Text>Color: {item.color}</Text>}
            </View>
            <Text style={[styles.cell, styles.qtyCell]}>{item.cantidad || 0}</Text>
            <Text style={[styles.cell, styles.unitCell]}>{Number(item.precio).toLocaleString('es-CO', { maximumFractionDigits: 0 })}</Text>
            <Text style={[styles.cell, styles.totalCell]}>
              {(Number(item.precio || 0) * Number(item.cantidad || 0)).toLocaleString('es-CO')}
            </Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}></Text>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalValue}>{Number(content.total).toLocaleString('es-CO', { maximumFractionDigits: 0 }) || 0}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default OrderPDF;
