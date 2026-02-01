import React from "react"
import Button from "@/components/ui/button/Button"
import OldButton from "@/components/old-ui/OldButton"
import { FaPlus, FaDownload, FaEnvelope } from "react-icons/fa"

/**
 * UI Examples Page - Compare Old vs New Button implementations
 */
const UIExamplesPage = () => {
    const variants = ["primary", "secondary", "danger", "success", "outline", "white", "ghost"]
    const sizes = ["small", "medium", "large"]

    return (
        <div className="min-h-screen bg-[var(--color-bg-page)] p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                    UI Examples - Button Comparison
                </h1>
                <p className="text-[var(--color-text-muted)] mb-8">
                    Comparing Old (Tailwind) vs New (CZero) button implementations
                </p>

                {/* Variants Comparison */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-[var(--color-text-secondary)] mb-4">
                        Variants
                    </h2>
                    <div className="bg-white rounded-xl border border-[var(--color-border-primary)] overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[var(--color-bg-tertiary)]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">Variant</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">Old (Tailwind)</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">New (CZero)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border-light)]">
                                {variants.map((variant) => (
                                    <tr key={variant}>
                                        <td className="px-4 py-4 text-sm font-mono text-[var(--color-text-body)]">{variant}</td>
                                        <td className="px-4 py-4">
                                            <OldButton variant={variant}>{variant}</OldButton>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Button variant={variant}>{variant}</Button>
                                        </td>
                                    </tr>
                                ))}
                                {/* Gradient variant */}
                                <tr>
                                    <td className="px-4 py-4 text-sm font-mono text-[var(--color-text-body)]">gradient</td>
                                    <td className="px-4 py-4">
                                        <OldButton variant="primary" gradient>gradient</OldButton>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Button variant="gradient">gradient</Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Sizes Comparison */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-[var(--color-text-secondary)] mb-4">
                        Sizes
                    </h2>
                    <div className="bg-white rounded-xl border border-[var(--color-border-primary)] overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[var(--color-bg-tertiary)]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">Size</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">Old (Tailwind)</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">New (CZero)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border-light)]">
                                {sizes.map((size) => (
                                    <tr key={size}>
                                        <td className="px-4 py-4 text-sm font-mono text-[var(--color-text-body)]">{size}</td>
                                        <td className="px-4 py-4">
                                            <OldButton size={size}>{size}</OldButton>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Button size={size}>{size}</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* States Comparison */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-[var(--color-text-secondary)] mb-4">
                        States
                    </h2>
                    <div className="bg-white rounded-xl border border-[var(--color-border-primary)] overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[var(--color-bg-tertiary)]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">State</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">Old (Tailwind)</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">New (CZero)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border-light)]">
                                <tr>
                                    <td className="px-4 py-4 text-sm font-mono text-[var(--color-text-body)]">disabled</td>
                                    <td className="px-4 py-4">
                                        <OldButton disabled>Disabled</OldButton>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Button disabled>Disabled</Button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-4 text-sm font-mono text-[var(--color-text-body)]">isLoading</td>
                                    <td className="px-4 py-4">
                                        <OldButton isLoading>Loading</OldButton>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Button isLoading>Loading</Button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-4 text-sm font-mono text-[var(--color-text-body)]">fullWidth</td>
                                    <td className="px-4 py-4">
                                        <OldButton fullWidth>Full Width</OldButton>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Button fullWidth>Full Width</Button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-4 text-sm font-mono text-[var(--color-text-body)]">rounded</td>
                                    <td className="px-4 py-4">
                                        <OldButton rounded>Rounded</OldButton>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Button rounded>Rounded</Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* With Icons */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-[var(--color-text-secondary)] mb-4">
                        With Icons
                    </h2>
                    <div className="bg-white rounded-xl border border-[var(--color-border-primary)] overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[var(--color-bg-tertiary)]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">Old (Tailwind)</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--color-text-muted)]">New (CZero)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border-light)]">
                                <tr>
                                    <td className="px-4 py-4 text-sm font-mono text-[var(--color-text-body)]">icon prop</td>
                                    <td className="px-4 py-4">
                                        <OldButton icon={<FaPlus />}>Add Item</OldButton>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Button icon={<FaPlus />}>Add Item</Button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-4 text-sm font-mono text-[var(--color-text-body)]">secondary + icon</td>
                                    <td className="px-4 py-4">
                                        <OldButton variant="secondary" icon={<FaDownload />}>Download</OldButton>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Button variant="secondary" icon={<FaDownload />}>Download</Button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-4 text-sm font-mono text-[var(--color-text-body)]">outline + icon</td>
                                    <td className="px-4 py-4">
                                        <OldButton variant="outline" icon={<FaEnvelope />}>Send Email</OldButton>
                                    </td>
                                    <td className="px-4 py-4">
                                        <Button variant="outline" icon={<FaEnvelope />}>Send Email</Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* All Variants in Each Size */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-[var(--color-text-secondary)] mb-4">
                        All Variants × All Sizes (New CZero)
                    </h2>
                    <div className="bg-white rounded-xl border border-[var(--color-border-primary)] p-6">
                        <div className="space-y-6">
                            {sizes.map((size) => (
                                <div key={size}>
                                    <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">Size: {size}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {variants.map((variant) => (
                                            <Button key={`${size}-${variant}`} variant={variant} size={size}>
                                                {variant}
                                            </Button>
                                        ))}
                                        <Button variant="gradient" size={size}>gradient</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default UIExamplesPage
