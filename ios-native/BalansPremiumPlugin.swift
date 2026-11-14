import Foundation
import StoreKit
import Capacitor

@objc(BalansPremiumPlugin)
public class BalansPremiumPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "BalansPremiumPlugin"
    public let jsName = "BalansPremium"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise)
    ]
    private let productId = "se.kusing.balans.premium.monthly"

    private func currentTransaction() async -> Transaction? {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result,
               transaction.productID == productId,
               transaction.revocationDate == nil,
               (transaction.expirationDate ?? .distantPast) > Date() {
                return transaction
            }
        }
        return nil
    }

    private func resolve(_ call: CAPPluginCall, transaction: Transaction?) {
        guard let t = transaction else { call.resolve(["active": false]); return }
        call.resolve([
            "active": true,
            "transactionId": String(t.id),
            "originalTransactionId": String(t.originalID),
            "expiresAt": Int((t.expirationDate ?? Date()).timeIntervalSince1970 * 1000)
        ])
    }

    @objc func status(_ call: CAPPluginCall) {
        Task { resolve(call, transaction: await currentTransaction()) }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        Task {
            do {
                guard let product = try await Product.products(for: [productId]).first else {
                    call.reject("Premium-abonnemanget finns inte i App Store Connect."); return
                }
                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    guard case .verified(let transaction) = verification else {
                        call.reject("Köpet kunde inte verifieras av StoreKit."); return
                    }
                    await transaction.finish()
                    resolve(call, transaction: await currentTransaction())
                case .pending: call.resolve(["active": false, "pending": true])
                case .userCancelled: call.resolve(["active": false, "cancelled": true])
                @unknown default: call.reject("Okänt köpsvar.")
                }
            } catch { call.reject(error.localizedDescription) }
        }
    }

    @objc func restore(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                resolve(call, transaction: await currentTransaction())
            } catch { call.reject(error.localizedDescription) }
        }
    }
}
