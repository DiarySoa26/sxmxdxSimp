// package com.sxmxdx.backend.service.budgetdetails;

// import com.sxmxdx.backend.repository.budgetdetails.BudgetDetailsRepository;
// import org.springframework.stereotype.Service;

// import java.util.List;

// @Service
// public class BudgetDetailsService {

//     private final BudgetDetailsRepository repository;

//     public BudgetDetailsService(
//             BudgetDetailsRepository repository
//     ) {
//         this.repository = repository;
//     }

//     public List<Object[]> getCharges(Integer exerciceId) {
//         return repository.getCharges(exerciceId);
//     }

//     public List<Object[]> getExportations(Integer exerciceId) {
//         return repository.getExportations(exerciceId);
//     }

//     public List<Object[]> getFraisExport(Integer exerciceId) {
//         return repository.getFraisExport(exerciceId);
//     }

//     public List<Object[]> getProduction(Integer exerciceId) {
//         return repository.getProduction(exerciceId);
//     }

//     public List<Object[]> getEmployes(Integer exerciceId) {
//         return repository.getEmployes(exerciceId);
//     }

//     public List<Object[]> getBudget(Integer exerciceId) {
//         return repository.getBudget(exerciceId);
//     }
// }



package com.sxmxdx.backend.service.budgetdetails;

import com.sxmxdx.backend.repository.budgetdetails.BudgetDetailsRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class BudgetDetailsService {

    private final BudgetDetailsRepository repository;

    public BudgetDetailsService(
            BudgetDetailsRepository repository
    ) {
        this.repository = repository;
    }


    public List<Map<String, Object>> getCharges(
            Integer exerciceId
    ) {
        return repository.getCharges(
                exerciceId
        );
    }


    public List<Map<String, Object>> getExportations(
            Integer exerciceId
    ) {
        return repository.getExportations(
                exerciceId
        );
    }


    public List<Map<String, Object>> getFraisExport(
            Integer exerciceId
    ) {
        return repository.getFraisExport(
                exerciceId
        );
    }


    public List<Map<String, Object>> getProduction(
            Integer exerciceId
    ) {
        return repository.getProduction(
                exerciceId
        );
    }


    public List<Map<String, Object>> getEmployes(
            Integer exerciceId
    ) {
        return repository.getEmployes(
                exerciceId
        );
    }


    public List<Map<String, Object>> getBudget(
            Integer exerciceId
    ) {
        return repository.getBudget(
                exerciceId
        );
    }


    public List<Map<String, Object>> getBudgetM(
            Integer budgetId
    ) {
        return repository.getBudgetM(
                budgetId
        );
    }
}