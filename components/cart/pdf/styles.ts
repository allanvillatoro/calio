import { StyleSheet } from '@react-pdf/renderer';

export const cartOrderPdfStyles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    color: '#111827',
    fontFamily: 'Helvetica',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logo: {
    height: 74,
    objectFit: 'contain',
    width: 140,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 22,
  },
  tableHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    color: '#6b7280',
    flexDirection: 'row',
    fontSize: 9,
    fontWeight: 700,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  headerImage: {
    width: 86,
  },
  headerDescription: {
    flex: 1,
  },
  headerPrice: {
    textAlign: 'right',
    width: 78,
  },
  item: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 14,
  },
  image: {
    height: 72,
    objectFit: 'contain',
    width: 72,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'none',
    color: 'black',
  },
  price: {
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'right',
    width: 78,
  },
  description: {
    color: '#4b5563',
    lineHeight: 1.4,
  },
  quantity: {
    marginTop: 6,
    fontSize: 12,
  },
  subtotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#111827',
    borderTopStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    paddingTop: 14,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: 700,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    marginTop: 28,
    paddingTop: 14,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    marginBottom: 10,
  },
  socialLink: {
    color: '#4b5563',
    fontSize: 11,
    textDecoration: 'none',
  },
  footerText: {
    color: '#4b5563',
    fontSize: 10,
    textAlign: 'center',
  },
});
