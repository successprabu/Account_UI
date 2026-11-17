import * as yup from "yup";

/** Validation for one moi receipt (shared by the entry form and the bulk import). */
export const schema = yup
  .object()
  .shape({
    villageName: yup.string().required(),
    name: yup.string().required(),
    initial: yup.string(),
    amount: yup
      .number()
      .required("Please Enter Old / New Amount")
      .positive("Please Enter Old / New Amount"),
    oldAmount: yup
      .number()
      .nullable()
      .transform((value) => (isNaN(value) ? null : value)),
    newAmount: yup
      .number()
      .nullable()
      .transform((value) => (isNaN(value) ? null : value)),
    phoneNo: yup.string().matches(/^\d*$/, "Please Enter Valid Number"),
    remarks: yup.string(),
  })
  .test(
    "either-old-or-new-amount",
    "Either old amount or new amount is required and must be greater than zero",
    function (values) {
      const { oldAmount, newAmount } = values;
      return (oldAmount && oldAmount > 0) || (newAmount && newAmount > 0);
    }
  );

export default schema;
