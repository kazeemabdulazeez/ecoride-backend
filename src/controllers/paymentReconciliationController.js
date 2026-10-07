const {
  reconcileTransaction,
} = require("../services/paymentReconciliationService");

const reconcilePayment = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        message: "transactionId is required.",
      });
    }

    const result = await reconcileTransaction(transactionId);

    if (!result.reconciled && result.reason === "Transaction not found.") {
      return res.status(404).json(result);
    }

    return res.status(200).json({
      message: result.reconciled
        ? "Payment reconciliation successful."
        : "Payment reconciliation detected inconsistencies.",
      ...result,
    });
  } catch (error) {
    console.error("Payment reconciliation error:", error);

    return res.status(500).json({
      message: "Failed to reconcile payment.",
    });
  }
};

module.exports = {
  reconcilePayment,
};